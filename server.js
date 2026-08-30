const express = require('express');
const path = require('path');
const { runner, scenarios } = require('./src/engine/missionRunner');

const app = express();
const PORT = process.env.PORT || 3010;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Lightweight Markdown to HTML renderer for artifacts & reports
function renderMarkdown(md) {
  if (!md) return '';
  const lines = md.split(/\r?\n/);
  let html = '';
  let inList = false;

  function formatInline(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="artifact-code font-mono">$1</code>');
  }

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h4 class="artifact-heading">${formatInline(line.slice(4))}</h4>`;
    } else if (line.startsWith('- ')) {
      if (!inList) { html += '<ul class="artifact-list">'; inList = true; }
      html += `<li class="artifact-list-item">${formatInline(line.slice(2))}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p class="artifact-paragraph">${formatInline(line)}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html;
}

app.locals.renderMarkdown = renderMarkdown;

// Store active SSE client response objects
const sseClients = new Set();

// Render all dashboard fragments with HTMX 4 OOB attributes
async function renderAllFragments(data) {
  const renderData = { ...data, renderMarkdown };
  const parts = await Promise.all([
    new Promise(res => app.render('partials/mission-status', renderData, (e, html) => res(html || ''))),
    new Promise(res => app.render('partials/reasoning-feed', renderData, (e, html) => res(html || ''))),
    new Promise(res => app.render('partials/task-board', renderData, (e, html) => res(html || ''))),
    new Promise(res => app.render('partials/approval-gate', renderData, (e, html) => res(html || ''))),
    new Promise(res => app.render('partials/artifact-view', renderData, (e, html) => res(html || '')))
  ]);

  return parts.join('\n');
}

// Convert HTML bundle into valid multiline SSE payload (preserves newlines in pre/diffs)
function toSsePayload(html) {
  return html
    .split(/\r?\n/)
    .map(line => `data: ${line}`)
    .join('\n') + '\n\n';
}

// Helper to broadcast HTMX SSE fragments
async function broadcastState() {
  const data = { state: runner.getState(), scenarios, renderMarkdown };
  const htmlBundle = await renderAllFragments(data);
  const sseMessage = toSsePayload(htmlBundle);
  sseClients.forEach(client => client.write(sseMessage));
}

// Broadcast on runner updates
runner.on('update', () => {
  broadcastState();
});

// SSE Streaming Route
app.get('/api/mission/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  // Send initial state snapshot immediately
  const data = { state: runner.getState(), scenarios, renderMarkdown };
  const htmlBundle = await renderAllFragments(data);
  res.write(toSsePayload(htmlBundle));

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Main Dashboard Page
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Mission Control // HTMX 4',
    state: runner.getState(),
    scenarios,
    renderMarkdown
  });
});

// HTMX Action Endpoints
app.post('/api/mission/start', (req, res) => {
  const { scenarioId, speed, autonomy } = req.body;
  runner.startMission(scenarioId, {
    speed: parseFloat(speed) || 1.0,
    autonomy: autonomy || 'human_gate'
  });
  res.status(204).end();
});

app.post('/api/mission/approve', (req, res) => {
  const approved = req.body.action !== 'reject';
  runner.approveGate(approved);
  res.status(204).end();
});

app.post('/api/mission/pause', (req, res) => {
  runner.pauseMission();
  res.status(204).end();
});

app.post('/api/mission/resume', (req, res) => {
  runner.resumeMission();
  res.status(204).end();
});

app.post('/api/mission/abort', (req, res) => {
  runner.abortMission();
  res.status(204).end();
});

app.post('/api/mission/reset', (req, res) => {
  runner.reset();
  runner.emitChange('mission_reset');
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`\n🛸 Mission Control HTMX 4 running at http://localhost:${PORT}`);
});
