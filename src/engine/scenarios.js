module.exports = {
  scenarios: [
    {
      id: 'security_audit',
      title: 'Zero-Day Vulnerability Sweep & Auto-Patch',
      icon: '🛡️',
      category: 'SecOps',
      description: 'Audit microservice infrastructure, isolate infected containers, and generate a self-healing kernel patch.',
      tasks: [
        { id: 't1', name: 'Port & Service Reconnaissance', tool: 'nmap_scanner', status: 'QUEUED', duration: 1800 },
        { id: 't2', name: 'Dependency Vulnerability Audit', tool: 'cve_db_lookup', status: 'QUEUED', duration: 2200 },
        { id: 't3', name: 'Exploit Sandbox Simulation', tool: 'sandbox_exec', status: 'QUEUED', duration: 2500 },
        { id: 't4', name: 'Generate Kernel Memory Patch', tool: 'code_synthesizer', status: 'QUEUED', duration: 2000 },
        { id: 't5', name: 'Deploy Live In-Memory Hotfix', tool: 'cluster_deployer', status: 'QUEUED', duration: 1500, requiresApproval: true }
      ],
      steps: [
        {
          thought: 'Initializing mission parameters. Establishing secure enclave connection and inspecting firewall rule tables...',
          delay: 900
        },
        {
          thought: 'Triggering parallel reconnaissance across ingress endpoints and microservice cluster nodes.',
          activeTask: 't1',
          taskStatus: 'RUNNING',
          delay: 1400
        },
        {
          thought: 'Scanning dependencies against CVE-2026-8941 database. Found 1 high-severity buffer overflow vector in auth daemon.',
          activeTask: 't2',
          taskStatus: 'RUNNING',
          taskDone: 't1',
          delay: 1500
        },
        {
          thought: 'Replicating payload exploit in isolated sandbox environment to verify exploitability and blast radius.',
          activeTask: 't3',
          taskStatus: 'RUNNING',
          taskDone: 't2',
          delay: 1800
        },
        {
          thought: 'Exploit confirmed: CVE-2026-8941 causes heap corruption on crafted JWT header. Synthesizing hotfix patch in C...',
          activeTask: 't4',
          taskStatus: 'RUNNING',
          taskDone: 't3',
          delay: 1600
        },
        {
          thought: 'Hotfix synthesized and verified in test harness. Preparing production zero-downtime deployment...',
          taskDone: 't4',
          delay: 1000
        },
        {
          gate: {
            title: 'Authorize Hotfix Deployment',
            actionName: 'Deploy Memory Hotfix to 24 Production Nodes',
            riskLevel: 'HIGH',
            diff: `--- a/src/auth/jwt_parser.c
+++ b/src/auth/jwt_parser.c
@@ -142,6 +142,9 @@ int parse_jwt_header(const char *header, size_t len) {
+    if (len > MAX_HEADER_SAFE_LEN) {
+        return ERR_HEADER_OVERFLOW;
+    }
     char *buf = malloc(len + 1);
     if (!buf) return ERR_NO_MEMORY;`
          },
          activeTask: 't5',
          taskStatus: 'AWAITING_APPROVAL'
        },
        {
          thought: 'Human authorization received. Rolling out in-memory patch across cluster nodes [1..24]...',
          taskStatus: 'RUNNING',
          activeTask: 't5',
          delay: 1800
        },
        {
          thought: 'All 24 nodes successfully patched and verified. Telemetry nominal. Zero downtime achieved.',
          taskDone: 't5',
          delay: 1000
        }
      ],
      artifact: {
        type: 'SECURITY_REPORT',
        title: 'Mission Incident Report: SEC-2026-08',
        markdown: `### Incident Summary & Resolution
- **Target Subsystem**: \`auth-service-v2\`
- **Vulnerability Identified**: \`CVE-2026-8941\` (JWT Heap Boundary Overflow)
- **Action Taken**: Synthesized boundary validation hotfix & deployed across 24 cluster nodes.
- **Downtime**: 0ms (In-Memory Hot Patch)
- **Status**: **RESOLVED & PROTECTED**`
      }
    },
    {
      id: 'market_intel',
      title: 'Autonomous Competitor & Market Intelligence',
      icon: '📊',
      category: 'Intel',
      description: 'Crawl financial filings, product changelogs, and patent applications to compile a strategic executive briefing.',
      tasks: [
        { id: 't1', name: 'Global SEC & Filing Crawler', tool: 'filing_ingest', status: 'QUEUED', duration: 1600 },
        { id: 't2', name: 'Product Changelog Semantic Diff', tool: 'diff_analyzer', status: 'QUEUED', duration: 2000 },
        { id: 't3', name: 'Patent Bureau Intercept', tool: 'patent_crawler', status: 'QUEUED', duration: 2200 },
        { id: 't4', name: 'Strategic Dossier Synthesis', tool: 'llm_synthesizer', status: 'QUEUED', duration: 1900 },
        { id: 't5', name: 'Publish to Executive War Room', tool: 'slack_webhook', status: 'QUEUED', duration: 1200, requiresApproval: true }
      ],
      steps: [
        {
          thought: 'Booting intelligence agents. Gathering target competitor entity identifiers and quarterly telemetry...',
          delay: 800
        },
        {
          thought: 'Streaming crawler queries across SEC Edgar filings and regional regulatory registries...',
          activeTask: 't1',
          taskStatus: 'RUNNING',
          delay: 1400
        },
        {
          thought: 'Detected major unannounced infrastructure expansion in Apex Corp filings (Q3 CAPEX +47%). Analyzing product diffs...',
          activeTask: 't2',
          taskStatus: 'RUNNING',
          taskDone: 't1',
          delay: 1600
        },
        {
          thought: 'Crawling USPTO patent grants. Found 3 newly published patents in Edge Vector Compute.',
          activeTask: 't3',
          taskStatus: 'RUNNING',
          taskDone: 't2',
          delay: 1800
        },
        {
          thought: 'Aggregating financial signals, patent discoveries, and hiring trends into strategic matrix...',
          activeTask: 't4',
          taskStatus: 'RUNNING',
          taskDone: 't3',
          delay: 1700
        },
        {
          thought: 'Strategic synthesis complete. Preparing broadcast to Executive War Room...',
          taskDone: 't4',
          delay: 800
        },
        {
          gate: {
            title: 'Authorize Intelligence Broadcast',
            actionName: 'Broadcast Classified Market Briefing to C-Suite Channel',
            riskLevel: 'MEDIUM',
            diff: `Confidential Intelligence Summary:
+ Competitor Apex Corp CAPEX increased by +47% in Q3
+ 3 New Edge Vector Compute patents discovered
+ Recommended Strategic Pivot: Accelerate Project Helios by 6 weeks`
          },
          activeTask: 't5',
          taskStatus: 'AWAITING_APPROVAL'
        },
        {
          thought: 'Approval confirmed. Dispatching encrypted executive briefing packet...',
          taskStatus: 'RUNNING',
          activeTask: 't5',
          delay: 1400
        },
        {
          thought: 'Broadcast transmitted successfully. Read receipts logged for 5 executives.',
          taskDone: 't5',
          delay: 800
        }
      ],
      artifact: {
        type: 'INTEL_DOSSIER',
        title: 'Executive Market Dossier: Apex Strategy Analysis',
        markdown: `### Strategic Insights & Signals
- **Primary Finding**: Apex Corp preparing aggressive transition into Edge Vector Compute.
- **Key Indicators**: CAPEX surge ($140M), 3 USPTO patent filings, 38 senior ML compiler hires.
- **Recommended Counter-Move**: Fast-track our on-premise inference stack to secure enterprise accounts.`
      }
    }
  ]
};
