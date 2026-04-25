/* ============================================
   ScamShield AI – app.js
   ============================================ */

const GlobalStore = {
  isMockMode: true,
  currentLang: 'en',
  stats: { totalAnalyzed: 1402, totalHighRisk: 342 },
  latestAnalysis: null,
  analysisCount: 0
};

/* ─────────────────────────────────────────
   TRANSLATIONS
───────────────────────────────────────── */
const T = {
  en: {
    analyzing: ['Initializing AI engine...', 'Scanning message patterns...', 'Detecting threat vectors...', 'Cross-referencing scam database...', 'Generating risk report...'],
    scamDetected: 'SCAM DETECTED',
    warning: 'SUSPICIOUS',
    safe: 'SAFE',
    riskScore: 'Risk Score',
    analysisSummary: '📝 Analysis Summary',
    threatElements: '🚩 Identified Threat Elements',
    viewDeepScan: '🔬 View Deep Scan',
    copySummary: '📋 Copy Summary',
    reportBtn: '🚨 Report to Cyber Cell',
    copied: '✅ Copied to clipboard!',
    noAnalysis: '⚠️ Please analyze a message first.',
    downloaded: '✅ JSON downloaded!',
    attackerIntent: { scam: 'Financial Theft', warning: 'Suspicious Activity', safe: 'Benign' },
    scamCategory: { scam: 'Phishing / Financial Fraud', warning: 'Suspicious Promotion', safe: 'Legitimate Message' },
    severity: { scam: 'HIGH', warning: 'MEDIUM', safe: 'LOW' }
  },
  ml: {
    analyzing: ['AI എഞ്ചിൻ ആരംഭിക്കുന്നു...', 'സന്ദേശ പാറ്റേണുകൾ സ്കാൻ ചെയ്യുന്നു...', 'ഭീഷണി വെക്‌ടറുകൾ കണ്ടെത്തുന്നു...', 'തട്ടിപ്പ് ഡേറ്റാബേസ് ക്രോസ്-റഫർ ചെയ്യുന്നു...', 'റിസ്ക് റിപ്പോർട്ട് തയ്യാറാക്കുന്നു...'],
    scamDetected: 'തട്ടിപ്പ് കണ്ടെത്തി',
    warning: 'സംശയാസ്പദം',
    safe: 'സുരക്ഷിതം',
    riskScore: 'അപകട സ്കോർ',
    analysisSummary: '📝 ഹ്രസ്വ വിശദീകരണം',
    threatElements: '🚩 തിരിച്ചറിഞ്ഞ ഭീഷണി ഘടകങ്ങൾ',
    viewDeepScan: '🔬 ആഴത്തിലുള്ള സ്കാൻ',
    copySummary: '📋 സംഗ്രഹം പകർത്തുക',
    reportBtn: '🚨 സൈബർ സെല്ലിൽ റിപ്പോർട്ട്',
    copied: '✅ ക്ലിപ്ബോർഡിലേക്ക് പകർത്തി!',
    noAnalysis: '⚠️ ആദ്യം ഒരു സന്ദേശം വിശകലനം ചെയ്യുക.',
    downloaded: '✅ JSON ഡൗൺലോഡ് ചെയ്തു!',
    attackerIntent: { scam: 'സാമ്പത്തിക മോഷണം', warning: 'സംശയകരമായ പ്രവർത്തനം', safe: 'നിരുപദ്രവകരം' },
    scamCategory: { scam: 'ഫിഷിംഗ് / സാമ്പത്തിക തട്ടിപ്പ്', warning: 'സംശയകരമായ പ്രമോഷൻ', safe: 'നിയമാനുസൃത സന്ദേശം' },
    severity: { scam: 'ഉയർന്നത്', warning: 'മിതമായത്', safe: 'കുറഞ്ഞത്' }
  }
};

/* ─────────────────────────────────────────
   MOCK ANALYSIS
───────────────────────────────────────── */
function getMockResult(text) {
  const lower = text.toLowerCase();
  if (lower.includes('bank') || lower.includes('urgent') || lower.includes('click') ||
      lower.includes('blocked') || lower.includes('sbi') || lower.includes('verify') ||
      lower.includes('otp') || lower.includes('account') || lower.includes('suspend') ||
      lower.includes('ബാങ്ക്') || lower.includes('അടിയന്തരം') || lower.includes('ഓടിപി')) {
    return {
      scam: 'Yes', risk: 94,
      reason: 'Phishing detected — urgent language and suspicious link. This matches known SBI/bank impersonation scam patterns targeting Indian users.',
      elements: ['🔗 Malicious URL detected', '⏰ Synthetic urgency injection', '🎭 Identity impersonation attempt', '⚠️ Threat of account closure']
    };
  } else if (lower.includes('free') || lower.includes('win') || lower.includes('offer') ||
             lower.includes('congratulations') || lower.includes('prize') || lower.includes('reward') ||
             lower.includes('lucky') || lower.includes('selected')) {
    return {
      scam: 'Warning', risk: 55,
      reason: 'Suspicious promotional content detected. Too-good-to-be-true offers are common social engineering tactics used by scammers.',
      elements: ['💰 Too-good-to-be-true promise', '📢 Unsolicited promotional language', '🎯 Action-oriented pressure keywords']
    };
  } else {
    return {
      scam: 'No', risk: 12,
      reason: 'Message appears legitimate. No common scam indicators detected. Natural conversation patterns observed.',
      elements: ['✅ Natural conversation pattern', '✅ No suspicious keywords detected', '🔒 Legitimate context identified']
    };
  }
}

/* ─────────────────────────────────────────
   ROUTING
───────────────────────────────────────── */
function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + hash);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === hash);
  });

  if (hash === 'dashboard') updateDashboardStats();
  if (hash === 'export' && GlobalStore.latestAnalysis) updateJsonViewer();
}

/* ─────────────────────────────────────────
   MAIN ANALYSIS HANDLER
───────────────────────────────────────── */
async function handleAnalyze() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text) {
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
    showToast('⚠️ Please paste a message to analyze.', 'error');
    return;
  }

  const analyzeBtn = document.getElementById('analyzeBtn');
  analyzeBtn.disabled = true;
  document.getElementById('resultCard').classList.add('hidden');

  const loadingEl = document.getElementById('loadingState');
  loadingEl.classList.remove('hidden');

  const msgs = T[GlobalStore.currentLang].analyzing;
  let msgIdx = 0;
  const loadingMsg = document.getElementById('loadingMsg');
  loadingMsg.textContent = msgs[0];
  const interval = setInterval(() => {
    msgIdx = (msgIdx + 1) % msgs.length;
    loadingMsg.textContent = msgs[msgIdx];
  }, 1200);

  await sleep(2400 + Math.random() * 600);
  clearInterval(interval);
  loadingEl.classList.add('hidden');

  const result = getMockResult(text);
  GlobalStore.latestAnalysis = { result, message: text, timestamp: new Date().toISOString(), reportId: generateReportId() };
  GlobalStore.stats.totalAnalyzed++;
  GlobalStore.analysisCount++;
  if (result.scam === 'Yes') GlobalStore.stats.totalHighRisk++;

  displayResult(result);
  unlockPages();
  updateAllPages(result, text);
  addToActivityTable(text, result.risk, result.scam !== 'No');

  analyzeBtn.disabled = false;
}

function displayResult(result) {
  const lang = GlobalStore.currentLang;
  const t = T[lang];
  const card = document.getElementById('resultCard');
  card.classList.remove('hidden');

  const verdictEl = document.getElementById('verdictBadge');
  verdictEl.className = 'verdict-badge';
  if (result.scam === 'Yes') {
    verdictEl.textContent = t.scamDetected;
    verdictEl.classList.add('verdict-scam');
  } else if (result.scam === 'Warning') {
    verdictEl.textContent = t.warning;
    verdictEl.classList.add('verdict-warning');
  } else {
    verdictEl.textContent = t.safe;
    verdictEl.classList.add('verdict-safe');
  }

  document.getElementById('riskBadge').textContent = result.risk + '%';

  const fill = document.getElementById('riskFill');
  fill.style.width = '0%';
  setTimeout(() => { fill.style.width = result.risk + '%'; }, 50);
  if (result.risk >= 70) fill.style.background = 'linear-gradient(90deg,#ef4444,#dc2626)';
  else if (result.risk >= 40) fill.style.background = 'linear-gradient(90deg,#f59e0b,#d97706)';
  else fill.style.background = 'linear-gradient(90deg,#10b981,#059669)';

  document.getElementById('resultReason').textContent = result.reason;

  const list = document.getElementById('elementsList');
  list.innerHTML = '';
  result.elements.forEach((el, i) => {
    const li = document.createElement('li');
    li.textContent = el;
    li.style.animationDelay = (i * 0.1) + 's';
    list.appendChild(li);
  });

  const langT = T[GlobalStore.currentLang];
  document.getElementById('viewDeepScan').textContent = langT.viewDeepScan;
  document.getElementById('copySummary').textContent = langT.copySummary;
  document.getElementById('reportBtn').textContent = langT.reportBtn;
}

/* ─────────────────────────────────────────
   UPDATE ALL PAGES
───────────────────────────────────────── */
function updateAllPages(result, message) {
  const lang = GlobalStore.currentLang;
  const t = T[lang];
  const store = GlobalStore.latestAnalysis;
  const resultKey = result.scam === 'Yes' ? 'scam' : result.scam === 'Warning' ? 'warning' : 'safe';

  // Deep Scan
  const intentEl = document.getElementById('scanIntent');
  intentEl.textContent = t.attackerIntent[resultKey];
  intentEl.style.color = result.scam === 'Yes' ? '#f87171' : result.scam === 'Warning' ? '#fcd34d' : '#34d399';

  const riskEl = document.getElementById('scanRisk');
  riskEl.textContent = result.risk + '%';
  riskEl.style.color = result.risk >= 70 ? '#f87171' : result.risk >= 40 ? '#fcd34d' : '#34d399';

  document.getElementById('scanReason').textContent = result.reason;
  document.getElementById('scanMessage').textContent = message;

  const tactics = document.getElementById('scanTactics');
  tactics.innerHTML = '';
  result.elements.forEach(el => {
    const li = document.createElement('li');
    li.textContent = el;
    tactics.appendChild(li);
  });

  // Report
  document.getElementById('reportId').textContent = store.reportId;
  document.getElementById('reportTimestamp').textContent = new Date(store.timestamp).toLocaleString('en-IN');
  document.getElementById('reportCategory').textContent = t.scamCategory[resultKey];
  const sevEl = document.getElementById('reportSeverity');
  sevEl.textContent = t.severity[resultKey];
  sevEl.className = 'report-val sev-' + (resultKey === 'scam' ? 'high' : resultKey === 'warning' ? 'medium' : 'low');
  document.getElementById('reportEvidence').textContent = message;

  // Export
  updateJsonViewer();
}

function updateJsonViewer() {
  const store = GlobalStore.latestAnalysis;
  if (!store) return;
  const payload = {
    reportId: store.reportId,
    timestamp: store.timestamp,
    verdict: store.result.scam,
    riskScore: store.result.risk,
    reason: store.result.reason,
    elements: store.result.elements,
    originalMessage: store.message,
    engine: 'ScamShield AI v2.1.0',
    language: GlobalStore.currentLang
  };
  document.getElementById('jsonViewer').textContent = JSON.stringify(payload, null, 2);
}

/* ─────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────── */
function updateDashboardStats() {
  animateCount('statTotal', GlobalStore.stats.totalAnalyzed);
  animateCount('statHighRisk', GlobalStore.stats.totalHighRisk);

  const ratio = GlobalStore.stats.totalHighRisk / GlobalStore.stats.totalAnalyzed;
  const threatEl = document.getElementById('statThreatLevel');
  if (ratio > 0.3) {
    threatEl.innerHTML = '<span class="threat-badge critical">CRITICAL</span>';
  } else if (ratio > 0.2) {
    threatEl.innerHTML = '<span class="threat-badge elevated">ELEVATED</span>';
  } else {
    threatEl.innerHTML = '<span class="threat-badge stable">STABLE</span>';
  }

  const smartAlert = document.getElementById('smartAlert');
  if (GlobalStore.analysisCount >= 2 && GlobalStore.stats.totalHighRisk > 340) {
    smartAlert.classList.remove('hidden');
  }
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el || el.querySelector('.threat-badge')) return;
  const start = parseInt(el.textContent.replace(/,/g, '')) || 0;
  const duration = 800;
  const startTime = performance.now();
  const update = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (target - start) * eased);
    el.textContent = value.toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function addToActivityTable(message, risk, isScam) {
  const tbody = document.getElementById('activityTable');
  const tr = document.createElement('tr');
  const excerpt = message.length > 40 ? message.substring(0, 40) + '…' : message;
  const dotClass = risk >= 70 ? 'dot-red' : risk >= 40 ? 'dot-orange' : 'dot-green';
  const statusLabel = risk >= 70 ? (GlobalStore.currentLang === 'ml' ? 'ഭീഷണി' : 'THREAT') :
                      risk >= 40 ? (GlobalStore.currentLang === 'ml' ? 'മുന്നറിയിപ്പ്' : 'WARN') :
                                   (GlobalStore.currentLang === 'ml' ? 'സുരക്ഷിതം' : 'SAFE');
  const riskColor = risk >= 70 ? '#f87171' : risk >= 40 ? '#fcd34d' : '#34d399';
  const delay = (tbody.children.length * 0.1) + 's';
  tr.style.animationDelay = delay;
  tr.innerHTML = `
    <td><span class="status-dot"><span class="dot ${dotClass}"></span>${statusLabel}</span></td>
    <td style="color:var(--text-secondary);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${excerpt}</td>
    <td style="color:${riskColor};font-weight:700">${risk}%</td>
    <td style="color:var(--text-secondary)">${new Date().toLocaleTimeString('en-IN')}</td>`;
  tbody.insertBefore(tr, tbody.firstChild);
  if (tbody.children.length > 10) tbody.removeChild(tbody.lastChild);
}

/* ─────────────────────────────────────────
   PAGE UNLOCK
───────────────────────────────────────── */
function unlockPages() {
  ['details', 'report', 'export'].forEach(page => {
    const link = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (link) link.classList.remove('locked');
  });
}

/* ─────────────────────────────────────────
   LANGUAGE
───────────────────────────────────────── */
function setLanguage(lang) {
  GlobalStore.currentLang = lang;
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.dataset[lang] || el.dataset.en;
  });
  document.querySelectorAll('[data-en-placeholder]').forEach(el => {
    el.placeholder = el.dataset[lang + 'Placeholder'] || el.dataset['enPlaceholder'];
  });
  document.getElementById('btnLangEn').classList.toggle('active', lang === 'en');
  document.getElementById('btnLangMl').classList.toggle('active', lang === 'ml');
  if (GlobalStore.latestAnalysis) {
    displayResult(GlobalStore.latestAnalysis.result);
    updateAllPages(GlobalStore.latestAnalysis.result, GlobalStore.latestAnalysis.message);
  }
  showToast(lang === 'ml' ? '🇮🇳 ഭാഷ മാറ്റി: മലയാളം' : '🌐 Language: English', 'info');
}

/* ─────────────────────────────────────────
   CLIPBOARD / EXPORT / REPORT
───────────────────────────────────────── */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(T[GlobalStore.currentLang].copied, 'success');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    showToast(T[GlobalStore.currentLang].copied, 'success');
  });
}

function exportJSON() {
  if (!GlobalStore.latestAnalysis) { showToast(T[GlobalStore.currentLang].noAnalysis, 'error'); return; }
  const store = GlobalStore.latestAnalysis;
  const payload = {
    reportId: store.reportId,
    timestamp: store.timestamp,
    verdict: store.result.scam,
    riskScore: store.result.risk,
    reason: store.result.reason,
    elements: store.result.elements,
    originalMessage: store.message,
    engine: 'ScamShield AI v2.1.0'
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = store.reportId + '.json';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast(T[GlobalStore.currentLang].downloaded, 'success');
}

function reportToCyberCell() {
  if (!GlobalStore.latestAnalysis) { showToast(T[GlobalStore.currentLang].noAnalysis, 'error'); return; }
  const store = GlobalStore.latestAnalysis;
  const subject = encodeURIComponent(`ScamShield Report: ${store.reportId}`);
  const body = encodeURIComponent(
    `ScamShield AI – Cyber Crime Report\n\nReport ID: ${store.reportId}\nTimestamp: ${store.timestamp}\nRisk Score: ${store.result.risk}%\nVerdict: ${store.result.scam}\n\nOriginal Message:\n${store.message}\n\nSuspicious Elements:\n${store.result.elements.join('\n')}`
  );
  window.open(`mailto:cybercell.kerala@police.gov.in?subject=${subject}&body=${body}`);
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function generateReportId() {
  return 'SCM-' + Math.random().toString(36).toUpperCase().slice(2, 10);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.35s ease forwards';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

/* ─────────────────────────────────────────
   PARTICLES
───────────────────────────────────────── */
function initParticles() {
  const container = document.getElementById('particles-container');
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
    p.style.animationDuration = (Math.random() * 15 + 8) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.opacity = Math.random() * 0.7 + 0.2;
    container.appendChild(p);
  }
}

/* ─────────────────────────────────────────
   INITIAL ACTIVITY DATA
───────────────────────────────────────── */
function populateInitialActivity() {
  const samples = [
    { msg: 'Dear customer, your SBI account has been blocked. Click link to verify immediately.', risk: 91, scam: true },
    { msg: 'Congratulations! You have won ₹50,000 prize. Send ₹200 processing fee to claim.', risk: 62, scam: true },
    { msg: 'Hey, are you coming to the meeting tomorrow at 10am? Let me know.', risk: 8, scam: false }
  ];
  samples.forEach(s => addToActivityTable(s.msg, s.risk, s.scam));
}

/* ─────────────────────────────────────────
   DEMO MESSAGES
───────────────────────────────────────── */
const demoMessages = {
  scam: `URGENT: Dear SBI customer, your account has been blocked due to suspicious activity. Click http://sbi-verify.xyz/login to verify your account immediately or it will be permanently blocked within 24 hours. Enter OTP to restore access.`,
  safe: `Hey Rajan! Just checking in — are we still on for the family get-together this Sunday? Mom said she'll be making Kerala fish curry. Let me know if you can make it. 😊`,
  ml: `പ്രിയ ഉപഭോക്താവ്, നിങ്ങളുടെ ബാങ്ക് അക്കൗണ്ട് ബ്ലോക്ക് ചെയ്തിരിക്കുന്നു. അടിയന്തരമായി ഈ ലിങ്കിൽ ക്ലിക്ക് ചെയ്ത് OTP നൽകുക: http://verify-bank.xyz. 24 മണിക്കൂറിനുള്ളിൽ ഇത് ചെയ്തില്ലെങ്കിൽ അക്കൗണ്ട് ഡിലീറ്റ് ചെയ്യും.`
};

/* ─────────────────────────────────────────
   EVENT LISTENERS + INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  populateInitialActivity();
  handleRoute();

  window.addEventListener('hashchange', handleRoute);

  document.getElementById('analyzeBtn').addEventListener('click', handleAnalyze);

  document.getElementById('demoScam').addEventListener('click', () => {
    document.getElementById('messageInput').value = demoMessages.scam;
  });
  document.getElementById('demoSafe').addEventListener('click', () => {
    document.getElementById('messageInput').value = demoMessages.safe;
  });
  document.getElementById('demoMl').addEventListener('click', () => {
    document.getElementById('messageInput').value = demoMessages.ml;
  });

  document.getElementById('viewDeepScan').addEventListener('click', () => {
    window.location.hash = '#details';
  });

  document.getElementById('copySummary').addEventListener('click', () => {
    if (!GlobalStore.latestAnalysis) { showToast(T[GlobalStore.currentLang].noAnalysis, 'error'); return; }
    const { result, message } = GlobalStore.latestAnalysis;
    const summary = `ScamShield AI Analysis\nVerdict: ${result.scam}\nRisk: ${result.risk}%\nReason: ${result.reason}\nMessage: ${message}`;
    copyToClipboard(summary);
  });

  document.getElementById('reportBtn').addEventListener('click', () => {
    reportToCyberCell();
    window.location.hash = '#report';
  });

  document.getElementById('downloadJson').addEventListener('click', exportJSON);

  document.getElementById('copyPayload').addEventListener('click', () => {
    const jsonText = document.getElementById('jsonViewer').textContent;
    if (!GlobalStore.latestAnalysis) { showToast(T[GlobalStore.currentLang].noAnalysis, 'error'); return; }
    copyToClipboard(jsonText);
  });

  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  document.querySelectorAll('.nav-link:not(.locked)').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('navLinks').classList.remove('open');
    });
  });

  document.getElementById('demoModeToggle').addEventListener('change', (e) => {
    GlobalStore.isMockMode = e.target.checked;
    showToast(e.target.checked ? '🧪 Demo Mode ON' : '🌐 Live Mode ON', 'info');
  });

  // keyboard shortcut: Enter key in textarea
  document.getElementById('messageInput').addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') handleAnalyze();
  });
});
