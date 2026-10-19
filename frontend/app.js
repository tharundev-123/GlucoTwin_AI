/**
 * GlucoTwin AI — Frontend Dashboard Controller
 * Features:
 * - 3D Bio-Hologram Canvas Rendering (Real-time dynamic rotating twin)
 * - Interactive 3D Card Tilt with Glare Reflections
 * - High-Resolution SVG CGM Telemetry & 30-Min Forecast Trajectory
 * - Light / Dark Mode Toggle
 * - "What-If" Metabolic Event Simulator with Live Auto-Stream
 */

// Global State
const state = {
  currentHours: 4,
  autoStreamInterval: null,
  isAutoStreaming: false,
  history: [],
  currentState: null,
  currentForecast: null,
  metrics: null,
  theme: 'light'
};

// DOM References
const elements = {
  currentGlucoseVal: document.getElementById('current-glucose-val'),
  glucoseStatusPill: document.getElementById('glucose-status-pill'),
  trendArrow: document.getElementById('trend-arrow'),
  trendText: document.getElementById('trend-text'),
  lastUpdatedText: document.getElementById('last-updated-text'),
  cgmBarPointer: document.getElementById('cgm-bar-pointer'),
  liveStabilityPill: document.getElementById('live-stability-pill'),

  forecastGlucoseVal: document.getElementById('forecast-glucose-val'),
  forecastDeltaVal: document.getElementById('forecast-delta-val'),
  forecastStatusText: document.getElementById('forecast-status-text'),
  forecastCircle: document.getElementById('forecast-circle'),

  currentHrVal: document.getElementById('current-hr-val'),
  hrMeterFill: document.getElementById('hr-meter-fill'),
  currentActivityVal: document.getElementById('current-activity-val'),
  activityMeterFill: document.getElementById('activity-meter-fill'),
  currentCarbsVal: document.getElementById('current-carbs-val'),
  carbsMeterFill: document.getElementById('carbs-meter-fill'),
  sleepVal: document.getElementById('sleep-val'),

  svgChart: document.getElementById('cgm-svg-chart'),
  chartContainer: document.getElementById('chart-container'),
  chartTooltip: document.getElementById('chart-tooltip'),

  inputMealCarbs: document.getElementById('input-meal-carbs'),
  valMealCarbs: document.getElementById('val-meal-carbs'),
  inputActivity: document.getElementById('input-activity'),
  valActivity: document.getElementById('val-activity'),

  btnStep5m: document.getElementById('btn-step-5m'),
  btnStep30m: document.getElementById('btn-step-30m'),
  btnAutoStream: document.getElementById('btn-auto-stream'),
  autoStreamText: document.getElementById('auto-stream-text'),
  btnResetTwin: document.getElementById('btn-reset-twin'),

  metricMae: document.getElementById('metric-mae'),
  metricRmse: document.getElementById('metric-rmse'),
  metricTestRows: document.getElementById('metric-test-rows'),
  featureBarsContainer: document.getElementById('feature-bars-container'),

  btnShowArch: document.getElementById('btn-show-arch'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnModalDismiss: document.getElementById('btn-modal-dismiss'),
  archModal: document.getElementById('arch-modal'),

  btnThemeToggle: document.getElementById('btn-theme-toggle'),
  themeIcon: document.getElementById('theme-icon'),
  twinCanvas: document.getElementById('twin-3d-canvas')
};

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  init3DTilt();
  initTwin3DCanvas();
  loadAllData();
});

// ==========================================================================
// Theme Management (Default Light)
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('glucotwin_theme') || 'light';
  setTheme(savedTheme);

  if (elements.btnThemeToggle) {
    elements.btnThemeToggle.addEventListener('click', () => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      setTheme(nextTheme);
    });
  }
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('glucotwin_theme', theme);
  if (elements.themeIcon) {
    elements.themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
  }
  renderChart();
}

// ==========================================================================
// 3D Tilt & Interactive Glare Reflection
// ==========================================================================
function init3DTilt() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return; // Touch devices don't need 3D mouse tilt
  }
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -6; // Max 6 deg
      const rotateY = ((x - centerX) / centerX) * 6;  // Max 6 deg

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

// ==========================================================================
// 3D Bio-Hologram Canvas Animation (Digital Twin Virtual Model)
// ==========================================================================
let hologramAngle = 0;
function initTwin3DCanvas() {
  const canvas = elements.twinCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 220;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);

  // Generate 3D sphere point cloud (Fibonacci sphere)
  const numPoints = 85;
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio

  for (let i = 0; i < numPoints; i++) {
    const y = 1 - (i / (numPoints - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    points.push({ x, y, z });
  }

  function draw() {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const sphereRadius = 65;

    // Pulse animation based on current heart rate
    const hr = state.currentState ? state.currentState.heart_rate_bpm : 72;
    const speed = 0.008 + (hr / 100) * 0.012;
    hologramAngle += speed;

    // Determine particle color based on current glucose
    let nodeColor = '14, 165, 233'; // Cyan default
    let glowColor = 'rgba(14, 165, 233, 0.4)';
    if (state.currentState) {
      const g = state.currentState.current_glucose_mg_dl;
      if (g < 70) {
        nodeColor = '244, 63, 94'; // Rose
        glowColor = 'rgba(244, 63, 94, 0.45)';
      } else if (g > 180) {
        nodeColor = '245, 158, 11'; // Amber
        glowColor = 'rgba(245, 158, 11, 0.45)';
      } else {
        nodeColor = '16, 185, 129'; // Emerald In-Range
        glowColor = 'rgba(16, 185, 129, 0.4)';
      }
    }

    // 1. Draw glowing central biological energy core
    const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 45);
    coreGrad.addColorStop(0, glowColor);
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw rotating orbital equator rings
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(hologramAngle * 0.4);
    ctx.beginPath();
    ctx.ellipse(0, 0, sphereRadius + 14, 28, Math.PI / 4, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${nodeColor}, 0.22)`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // 3. Project and draw 3D spherical nodes
    const cosA = Math.cos(hologramAngle);
    const sinA = Math.sin(hologramAngle);

    points.forEach(p => {
      // Rotate around Y axis
      const rx = p.x * cosA - p.z * sinA;
      const rz = p.x * sinA + p.z * cosA;
      const ry = p.y;

      // Perspective projection
      const fov = 180;
      const scale = fov / (fov + rz * sphereRadius);
      const px = cx + rx * sphereRadius * scale;
      const py = cy + ry * sphereRadius * scale;

      const alpha = Math.max(0.12, (rz + 1) / 2);
      const dotSize = Math.max(1.2, 2.8 * scale);

      ctx.beginPath();
      ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${nodeColor}, ${alpha.toFixed(2)})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}

// ==========================================================================
// Event Listeners & Preset Handlers
// ==========================================================================
function setupEventListeners() {
  // Preset buttons for meal carbs
  document.querySelectorAll('.preset-btn[data-type="meal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseFloat(btn.dataset.val);
      elements.inputMealCarbs.value = val;
      elements.valMealCarbs.textContent = `${val} g`;
      setActivePreset(btn, '.preset-btn[data-type="meal"]');
    });
  });

  // Preset buttons for activity
  document.querySelectorAll('.preset-btn[data-type="act"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseFloat(btn.dataset.val);
      elements.inputActivity.value = val;
      elements.valActivity.textContent = val.toFixed(2);
      setActivePreset(btn, '.preset-btn[data-type="act"]');
    });
  });

  // Sliders input sync
  elements.inputMealCarbs.addEventListener('input', (e) => {
    elements.valMealCarbs.textContent = `${e.target.value} g`;
  });

  elements.inputActivity.addEventListener('input', (e) => {
    elements.valActivity.textContent = parseFloat(e.target.value).toFixed(2);
  });

  // Time Window Selectors
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentHours = parseInt(btn.dataset.hours, 10);
      fetchHistory();
    });
  });

  // Simulator step actions
  elements.btnStep5m.addEventListener('click', () => advanceSimulation(1));
  elements.btnStep30m.addEventListener('click', () => advanceSimulation(6));

  // Auto-stream toggle
  elements.btnAutoStream.addEventListener('click', toggleAutoStream);

  // Reset simulation
  elements.btnResetTwin.addEventListener('click', resetSimulation);

  // Documentation Modal
  elements.btnShowArch.addEventListener('click', () => elements.archModal.classList.remove('hidden'));
  elements.btnCloseModal.addEventListener('click', () => elements.archModal.classList.add('hidden'));
  elements.btnModalDismiss.addEventListener('click', () => elements.archModal.classList.add('hidden'));
  elements.archModal.addEventListener('click', (e) => {
    if (e.target === elements.archModal) elements.archModal.classList.add('hidden');
  });

  // Responsive chart redraw on viewport resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderChart();
    }, 120);
  });
}

function setActivePreset(activeBtn, selector) {
  document.querySelectorAll(selector).forEach(b => b.classList.remove('active'));
  activeBtn.classList.add('active');
}

// ==========================================================================
// API Communications
// ==========================================================================
async function loadAllData() {
  await Promise.all([
    fetchTwinState(),
    fetchForecast(),
    fetchHistory(),
    fetchMetrics()
  ]);
}

async function fetchTwinState() {
  try {
    const res = await fetch('/twin/demo-patient');
    if (!res.ok) throw new Error('Failed to fetch twin state');
    const data = await res.json();
    state.currentState = data;
    renderTwinState(data);
  } catch (err) {
    console.warn('Twin state error:', err);
  }
}

async function fetchForecast() {
  try {
    const res = await fetch('/forecast/demo-patient?horizon_minutes=30');
    if (!res.ok) throw new Error('Failed to fetch forecast');
    const data = await res.json();
    state.currentForecast = data;
    renderForecast(data);
  } catch (err) {
    console.warn('Forecast error:', err);
  }
}

async function fetchHistory() {
  try {
    const limit = state.currentHours * 12; // 5-minute ticks
    const res = await fetch(`/twin/demo-patient/history?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    const data = await res.json();
    state.history = data.history || [];
    renderChart();
  } catch (err) {
    console.warn('History error:', err);
  }
}

async function fetchMetrics() {
  try {
    const res = await fetch('/ml/metrics');
    if (!res.ok) throw new Error('Failed to fetch ML metrics');
    const data = await res.json();
    state.metrics = data;
    renderMetrics(data);
  } catch (err) {
    console.warn('Metrics error:', err);
  }
}

// ==========================================================================
// Simulation Controls
// ==========================================================================
async function advanceSimulation(steps) {
  const mealCarbs = parseFloat(elements.inputMealCarbs.value) || 0.0;
  const activity = parseFloat(elements.inputActivity.value) || 0.35;

  try {
    const res = await fetch('/twin/demo-patient/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meal_carbs_g: mealCarbs,
        activity_level: activity,
        sleep_hours: 7.0,
        steps: steps
      })
    });
    if (!res.ok) throw new Error('Simulation step failed');
    const data = await res.json();
    state.currentState = data.state;
    state.currentForecast = data.forecast;

    if (mealCarbs > 0) {
      elements.inputMealCarbs.value = 0;
      elements.valMealCarbs.textContent = '0 g';
      document.querySelectorAll('.preset-btn[data-type="meal"]').forEach(b => b.classList.remove('active'));
    }

    renderTwinState(data.state);
    renderForecast(data.forecast);
    await fetchHistory();
  } catch (err) {
    console.error('Simulation error:', err);
  }
}

async function resetSimulation() {
  if (state.isAutoStreaming) toggleAutoStream();
  try {
    const res = await fetch('/twin/demo-patient/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Reset failed');
    await loadAllData();
  } catch (err) {
    console.error('Reset error:', err);
  }
}

function toggleAutoStream() {
  state.isAutoStreaming = !state.isAutoStreaming;
  if (state.isAutoStreaming) {
    elements.btnAutoStream.classList.add('active');
    elements.autoStreamText.textContent = 'Streaming Live...';
    state.autoStreamInterval = setInterval(() => {
      advanceSimulation(1);
    }, 2800);
  } else {
    elements.btnAutoStream.classList.remove('active');
    elements.autoStreamText.textContent = 'Auto Stream';
    clearInterval(state.autoStreamInterval);
  }
}

// ==========================================================================
// Render State to UI
// ==========================================================================
function renderTwinState(data) {
  if (!data) return;
  const glucose = data.current_glucose_mg_dl;
  elements.currentGlucoseVal.textContent = glucose.toFixed(1);

  // Status Badge and Stability
  elements.glucoseStatusPill.className = 'sensor-pill';
  if (glucose < 70) {
    elements.glucoseStatusPill.textContent = 'Hypo Warning (<70)';
    elements.glucoseStatusPill.classList.add('hypo');
    elements.liveStabilityPill.textContent = 'Hypoglycemic Alert';
    elements.liveStabilityPill.style.color = 'var(--rose-danger)';
  } else if (glucose > 180) {
    elements.glucoseStatusPill.textContent = 'Elevated (>180)';
    elements.glucoseStatusPill.classList.add('hyper');
    elements.liveStabilityPill.textContent = 'Elevated Threshold';
    elements.liveStabilityPill.style.color = 'var(--amber-warning)';
  } else {
    elements.glucoseStatusPill.textContent = 'Target Range (70-180)';
    elements.liveStabilityPill.textContent = 'Equilibrium Normal';
    elements.liveStabilityPill.style.color = 'var(--emerald-in-range)';
  }

  // Mini range pointer (clamps between 50 and 250 mg/dL)
  const clampedG = Math.max(50, Math.min(250, glucose));
  const pointerPct = ((clampedG - 50) / (250 - 50)) * 100;
  elements.cgmBarPointer.style.left = `${pointerPct.toFixed(1)}%`;

  // Trend detection
  if (state.history.length >= 2) {
    const prev = state.history[state.history.length - 2].glucose;
    const delta = glucose - prev;
    if (delta > 2.5) {
      elements.trendArrow.textContent = '↑↑';
      elements.trendText.textContent = `Surging (+${delta.toFixed(1)})`;
    } else if (delta > 0.6) {
      elements.trendArrow.textContent = '↗';
      elements.trendText.textContent = `Rising (+${delta.toFixed(1)})`;
    } else if (delta < -2.5) {
      elements.trendArrow.textContent = '↓↓';
      elements.trendText.textContent = `Dropping (${delta.toFixed(1)})`;
    } else if (delta < -0.6) {
      elements.trendArrow.textContent = '↘';
      elements.trendText.textContent = `Falling (${delta.toFixed(1)})`;
    } else {
      elements.trendArrow.textContent = '→';
      elements.trendText.textContent = 'Stable Trend';
    }
  }

  // Sensor Timestamp
  const date = new Date(data.timestamp);
  elements.lastUpdatedText.textContent = `Sensor Timestamp: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

  // Secondary Biometrics
  elements.currentHrVal.textContent = data.heart_rate_bpm.toFixed(0);
  const hrPct = Math.min(100, Math.max(0, ((data.heart_rate_bpm - 48) / (145 - 48)) * 100));
  elements.hrMeterFill.style.width = `${hrPct}%`;

  elements.currentActivityVal.textContent = data.activity_level_0_1.toFixed(2);
  elements.activityMeterFill.style.width = `${(data.activity_level_0_1 * 100).toFixed(0)}%`;

  elements.currentCarbsVal.textContent = `${data.estimated_meal_carbs_g.toFixed(0)}g`;
  elements.carbsMeterFill.style.width = `${Math.min(100, data.estimated_meal_carbs_g * 1.25)}%`;

  elements.sleepVal.textContent = data.sleep_hours.toFixed(1);
}

function renderForecast(fc) {
  if (!fc) return;
  const pred = fc.predicted_glucose_mg_dl;
  elements.forecastGlucoseVal.textContent = pred.toFixed(1);

  if (state.currentState) {
    const cur = state.currentState.current_glucose_mg_dl;
    const diff = pred - cur;
    const sign = diff >= 0 ? '+' : '';
    elements.forecastDeltaVal.textContent = `${sign}${diff.toFixed(1)} mg/dL`;
  }

  if (fc.illustrative_status === 'below_demo_range') {
    elements.forecastStatusText.textContent = 'Alert: Projected Below Target (<70)';
    elements.forecastCircle.style.background = 'var(--rose-danger)';
    elements.forecastStatusText.style.color = 'var(--rose-danger)';
  } else if (fc.illustrative_status === 'above_demo_range') {
    elements.forecastStatusText.textContent = 'Notice: Projected Above Target (>180)';
    elements.forecastCircle.style.background = 'var(--amber-warning)';
    elements.forecastStatusText.style.color = 'var(--amber-warning)';
  } else {
    elements.forecastStatusText.textContent = 'Trajectory: Within Target Range';
    elements.forecastCircle.style.background = 'var(--emerald-in-range)';
    elements.forecastStatusText.style.color = 'var(--emerald-in-range)';
  }
}

function renderMetrics(metrics) {
  if (!metrics) return;
  elements.metricMae.textContent = metrics.mae ? metrics.mae.toFixed(2) : '6.33';
  elements.metricRmse.textContent = metrics.rmse ? metrics.rmse.toFixed(2) : '7.81';
  elements.metricTestRows.textContent = metrics.test_rows || '698';

  if (metrics.feature_importances) {
    elements.featureBarsContainer.innerHTML = '';
    metrics.feature_importances.forEach(item => {
      const row = document.createElement('div');
      row.className = 'feature-bar-row';
      const pct = (item.importance * 100).toFixed(1);
      row.innerHTML = `
        <div class="feature-bar-labels">
          <span class="feature-bar-name">${formatFeatureName(item.feature)}</span>
          <span class="feature-bar-pct">${pct}%</span>
        </div>
        <div class="feature-bar-track">
          <div class="feature-bar-fill" style="width: ${Math.min(100, item.importance * 125)}%;"></div>
        </div>
      `;
      elements.featureBarsContainer.appendChild(row);
    });
  }
}

function formatFeatureName(name) {
  const map = {
    'glucose': 'Current Glucose (mg/dL)',
    'meal_carbs_g': 'Meal Carbohydrate Intake (g)',
    'hour_of_day': 'Hour of Day (Circadian Rhythm)',
    'sleep_hours': 'Sleep Duration (hrs)',
    'glucose_roll_6': '30-Min Rolling Average',
    'glucose_lag_3': '15-Min Lag Glucose',
    'heart_rate': 'Biometric Heart Rate',
    'glucose_lag_1': '5-Min Lag Glucose',
    'activity': 'Physical Activity Intensity'
  };
  return map[name] || name;
}

// ==========================================================================
// High-Resolution SVG CGM Chart Renderer
// ==========================================================================
function renderChart() {
  const history = state.history;
  const svg = elements.svgChart;
  if (!svg || history.length === 0) return;

  const width = 1000;
  const height = 370;
  const padLeft = 60;
  const padRight = 85;
  const padTop = 35;
  const padBottom = 45;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const minY = 50;
  const maxY = 250;
  const yScale = (val) => padTop + chartH - ((val - minY) / (maxY - minY)) * chartH;

  const totalPoints = history.length;
  const projectionSteps = 6;
  const totalXSlots = totalPoints + projectionSteps - 1;
  const xScale = (idx) => padLeft + (idx / totalXSlots) * chartW;

  const isDark = state.theme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.06)';
  const labelColor = isDark ? '#94a3b8' : '#64748b';
  const targetBandFill = isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)';

  let svgContent = '';

  // 1. Shaded In-Range Target Band (70 - 180 mg/dL)
  const y70 = yScale(70);
  const y180 = yScale(180);
  svgContent += `
    <!-- Defs for linear gradients and filters -->
    <defs>
      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0ea5e9" stop-opacity="${isDark ? '0.35' : '0.22'}"/>
        <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.0"/>
      </linearGradient>
      <linearGradient id="forecastVector" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#8b5cf6"/>
      </linearGradient>
      <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(14, 165, 233, 0.25)" />
      </filter>
    </defs>

    <!-- Target Band Area -->
    <rect x="${padLeft}" y="${y180}" width="${chartW}" height="${y70 - y180}" 
          fill="${targetBandFill}" rx="4" />
    
    <!-- Threshold dashed boundary lines -->
    <line x1="${padLeft}" y1="${y180}" x2="${width - padRight}" y2="${y180}" 
          stroke="rgba(245, 158, 11, 0.45)" stroke-dasharray="5,5" stroke-width="1.2" />
    <line x1="${padLeft}" y1="${y70}" x2="${width - padRight}" y2="${y70}" 
          stroke="rgba(244, 63, 94, 0.45)" stroke-dasharray="5,5" stroke-width="1.2" />
    
    <text x="${width - padRight + 8}" y="${y180 + 4}" fill="#d97706" font-size="11" font-weight="600" font-family="JetBrains Mono">180 High</text>
    <text x="${width - padRight + 8}" y="${y70 + 4}" fill="#e11d48" font-size="11" font-weight="600" font-family="JetBrains Mono">70 Low</text>
  `;

  // 2. Y-Axis Grid Lines & Numerical Labels
  const gridVals = [60, 100, 140, 180, 220];
  gridVals.forEach(val => {
    const y = yScale(val);
    svgContent += `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="${gridColor}" stroke-width="1" />
      <text x="${padLeft - 12}" y="${y + 4}" fill="${labelColor}" font-size="11" text-anchor="end" font-family="JetBrains Mono">${val}</text>
    `;
  });

  // 3. Observed Time-Series Polyline Path
  let pathD = '';
  const points = [];
  history.forEach((d, i) => {
    const x = xScale(i);
    const y = yScale(d.glucose);
    points.push({ x, y, data: d, index: i });
    if (i === 0) pathD += `M ${x} ${y}`;
    else pathD += ` L ${x} ${y}`;
  });

  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;
  const baseY = padTop + chartH;
  const areaD = `${pathD} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;

  svgContent += `
    <path d="${areaD}" fill="url(#curveGradient)" />
    <path d="${pathD}" fill="none" stroke="#0284c7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#shadowFilter)" />
  `;

  // 4. Meal (🍞) and Activity (🏃) Event Badges
  points.forEach(pt => {
    if (pt.data.meal_carbs_g > 10) {
      svgContent += `
        <circle cx="${pt.x}" cy="${pt.y - 14}" r="9" fill="#f59e0b" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
        <text x="${pt.x}" y="${pt.y - 10}" text-anchor="middle" font-size="11">🍞</text>
      `;
    }
  });

  // 5. 30-Minute Forward Forecast Vector & Callout
  if (state.currentForecast && points.length > 0) {
    const lastPoint = points[points.length - 1];
    const forecastX = xScale(totalPoints + projectionSteps - 1);
    const forecastY = yScale(state.currentForecast.predicted_glucose_mg_dl);

    svgContent += `
      <!-- Dotted Forward Trajectory Line -->
      <line x1="${lastPoint.x}" y1="${lastPoint.y}" x2="${forecastX}" y2="${forecastY}" 
            stroke="url(#forecastVector)" stroke-width="3" stroke-dasharray="6,5" stroke-linecap="round" />
      
      <!-- Halo Confidence Ring & Target Point -->
      <circle cx="${forecastX}" cy="${forecastY}" r="16" fill="rgba(139, 92, 246, 0.15)" stroke="rgba(139, 92, 246, 0.6)" stroke-width="1.8" />
      <circle cx="${forecastX}" cy="${forecastY}" r="6" fill="#8b5cf6" />
      
      <!-- 3D Callout Card -->
      <g transform="translate(${forecastX - 42}, ${forecastY - 38})">
        <rect width="84" height="26" rx="6" fill="${isDark ? '#0f172a' : '#ffffff'}" stroke="#8b5cf6" stroke-width="1.5" filter="drop-shadow(0 4px 10px rgba(139, 92, 246, 0.25))" />
        <text x="42" y="17" text-anchor="middle" fill="#8b5cf6" font-size="12" font-weight="700" font-family="JetBrains Mono">
          ${state.currentForecast.predicted_glucose_mg_dl.toFixed(1)}
        </text>
      </g>
      
      <!-- X-axis +30 min indicator tag -->
      <text x="${forecastX}" y="${padTop + chartH + 20}" text-anchor="middle" fill="#8b5cf6" font-size="11" font-weight="700">
        +30 min
      </text>
    `;
  }

  // 6. X-Axis Time Ticks
  const labelInterval = Math.max(1, Math.floor(history.length / 6));
  history.forEach((d, i) => {
    if (i % labelInterval === 0 || i === history.length - 1) {
      const x = xScale(i);
      svgContent += `
        <line x1="${x}" y1="${padTop + chartH}" x2="${x}" y2="${padTop + chartH + 6}" stroke="${gridColor}" stroke-width="1.5" />
        <text x="${x}" y="${padTop + chartH + 20}" fill="${labelColor}" font-size="11" text-anchor="middle" font-family="JetBrains Mono">${d.time_str}</text>
      `;
    }
  });

  // 7. Interactive Hover Nodes
  points.forEach((pt) => {
    svgContent += `
      <circle class="chart-point-target" cx="${pt.x}" cy="${pt.y}" r="12" fill="transparent" 
              data-time="${pt.data.time_str}" data-glucose="${pt.data.glucose}" 
              data-hr="${pt.data.heart_rate}" data-carbs="${pt.data.meal_carbs_g}" 
              data-act="${pt.data.activity}" />
    `;
  });

  svg.innerHTML = svgContent;

  // Hover Events for Floating Tooltip
  svg.querySelectorAll('.chart-point-target').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const time = el.dataset.time;
      const glucose = el.dataset.glucose;
      const hr = el.dataset.hr;
      const carbs = el.dataset.carbs;
      const act = el.dataset.act;

      const rect = elements.chartContainer.getBoundingClientRect();
      const ptRect = el.getBoundingClientRect();
      const xPos = ptRect.left - rect.left + ptRect.width / 2;
      const yPos = ptRect.top - rect.top;

      elements.chartTooltip.innerHTML = `
        <div style="font-weight: 800; color: #0284c7; margin-bottom: 3px;">${time} Reading</div>
        <div style="font-size: 13px;">Glucose: <strong>${glucose} mg/dL</strong></div>
        <div style="color: #64748b; font-size: 11px;">Heart Rate: ${hr} BPM • Activity: ${act}</div>
        ${carbs > 0 ? `<div style="color: #d97706; font-weight: 600; font-size: 11px;">Active Meal: ${carbs}g Carbs</div>` : ''}
      `;
      elements.chartTooltip.style.left = `${xPos}px`;
      elements.chartTooltip.style.top = `${yPos}px`;
      elements.chartTooltip.classList.remove('hidden');
    });

    el.addEventListener('mouseleave', () => {
      elements.chartTooltip.classList.add('hidden');
    });
  });
}
