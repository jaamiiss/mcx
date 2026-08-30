const { EventEmitter } = require('events');
const { scenarios } = require('./scenarios');

class MissionRunner extends EventEmitter {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    this.status = 'IDLE'; // IDLE, RUNNING, PAUSED, AWAITING_APPROVAL, COMPLETED, ABORTED
    this.currentScenario = null;
    this.thoughts = [];
    this.tasks = [];
    this.pendingGate = null;
    this.artifact = null;
    this.currentStepIndex = 0;
    this.timer = null;
    this.speedMultiplier = 1.0;
    this.autonomyLevel = 'human_gate'; // 'human_gate' or 'full_auto'
  }

  getState() {
    return {
      status: this.status,
      scenario: this.currentScenario,
      thoughts: this.thoughts,
      tasks: this.tasks,
      pendingGate: this.pendingGate,
      artifact: this.artifact,
      currentStepIndex: this.currentStepIndex,
      speedMultiplier: this.speedMultiplier,
      autonomyLevel: this.autonomyLevel
    };
  }

  startMission(scenarioId, options = {}) {
    const scenario = scenarios.find(s => s.id === scenarioId) || scenarios[0];
    this.reset();
    this.currentScenario = scenario;
    this.status = 'RUNNING';
    this.tasks = JSON.parse(JSON.stringify(scenario.tasks));
    this.speedMultiplier = options.speed || 1.0;
    this.autonomyLevel = options.autonomy || 'human_gate';

    this.emitChange('mission_started');
    this.executeNextStep();
  }

  async executeNextStep() {
    if (this.status !== 'RUNNING') return;

    const steps = this.currentScenario.steps;
    if (this.currentStepIndex >= steps.length) {
      this.status = 'COMPLETED';
      this.artifact = this.currentScenario.artifact;
      this.emitChange('mission_completed');
      return;
    }

    const step = steps[this.currentStepIndex];

    // Handle task completions
    if (step.taskDone) {
      const t = this.tasks.find(x => x.id === step.taskDone);
      if (t) t.status = 'SUCCESS';
      this.emitChange('task_updated', { taskId: step.taskDone });
    }

    // Handle task activations
    if (step.activeTask && step.taskStatus) {
      const t = this.tasks.find(x => x.id === step.activeTask);
      if (t) t.status = step.taskStatus;
      this.emitChange('task_updated', { taskId: step.activeTask });
    }

    // Handle thoughts / chain of reasoning
    if (step.thought) {
      this.thoughts.push({
        id: 'th_' + Date.now() + '_' + this.currentStepIndex,
        timestamp: new Date().toLocaleTimeString(),
        text: step.thought
      });
      this.emitChange('reasoning_updated');
    }

    // Handle human approval gate
    if (step.gate) {
      if (this.autonomyLevel === 'full_auto') {
        // Auto-approve in full auto mode after slight delay
        this.thoughts.push({
          id: 'th_auto_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          text: `[FULL-AUTO AUTONOMY] System automatically approved: ${step.gate.actionName}`
        });
        this.currentStepIndex++;
        const delay = 1000 / this.speedMultiplier;
        this.timer = setTimeout(() => this.executeNextStep(), delay);
      } else {
        this.status = 'AWAITING_APPROVAL';
        this.pendingGate = step.gate;
        this.emitChange('approval_required');
        return; // Halt execution until approveGate is called
      }
      return;
    }

    this.currentStepIndex++;
    const delay = (step.delay || 1200) / this.speedMultiplier;
    this.timer = setTimeout(() => {
      this.executeNextStep();
    }, delay);
  }

  approveGate(approved = true) {
    if (this.status !== 'AWAITING_APPROVAL') return;

    if (approved) {
      this.status = 'RUNNING';
      this.pendingGate = null;
      this.currentStepIndex++;
      this.emitChange('approval_resolved', { approved: true });
      this.executeNextStep();
    } else {
      this.status = 'ABORTED';
      this.pendingGate = null;
      this.thoughts.push({
        id: 'th_reject_' + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        text: `⛔ Action rejected by Operator. Mission halted safely.`
      });
      this.emitChange('mission_aborted');
    }
  }

  pauseMission() {
    if (this.status === 'RUNNING') {
      this.status = 'PAUSED';
      if (this.timer) clearTimeout(this.timer);
      this.emitChange('mission_paused');
    }
  }

  resumeMission() {
    if (this.status === 'PAUSED') {
      this.status = 'RUNNING';
      this.emitChange('mission_resumed');
      this.executeNextStep();
    }
  }

  abortMission() {
    this.status = 'ABORTED';
    if (this.timer) clearTimeout(this.timer);
    this.pendingGate = null;
    this.emitChange('mission_aborted');
  }

  emitChange(eventType, extraData = {}) {
    this.emit('update', {
      eventType,
      state: this.getState(),
      ...extraData
    });
  }
}

const runner = new MissionRunner();
module.exports = { runner, scenarios };
