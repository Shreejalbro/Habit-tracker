Chart.register(ChartDataLabels);

const weekDays = ['Sunday',
  'Monday', 'Tuesday',
  'Wednesday', 'Thursday',
  'Friday', 'Saturday'
];
const today = new Date();
const todayStr = weekDays[today
  .getDay()];
const todayDateKey = today
  .toISOString().split('T')[
    0];

let chartsLoaded = false;

window.addEventListener('load',
  () => {
    const loader =
      document
      .getElementById(
        'systemLoader'
      );
    const body =
      document.body;
    
    setTimeout(() => {
      loader
        .classList
        .add(
          'loader-hidden'
        );
      body.classList
        .add(
          'content-ready'
        );
      setTimeout
        (() => {
            chartsLoaded
              =
              true;
            updateCharts
              ();
            loader
              .remove();
          },
          700
        );
    }, 1500);
  });

// Data Loading
let habits = JSON.parse(
  localStorage.getItem(
    'metrics_v3_habits')
) || [];
let completionLog = JSON.parse(
  localStorage.getItem(
    'metrics_v3_log')
) || {};
let lastVisitDate = localStorage
  .getItem(
    'metrics_v3_last_date');
let lastReportDate =
  localStorage.getItem(
    'metrics_v3_last_report'
  );

// Daily Reset Logic
if (lastVisitDate !==
  todayDateKey) {
  if (!completionLog[
      todayStr])
    completionLog[
      todayStr] = [];
  localStorage.setItem(
    'metrics_v3_last_date',
    todayDateKey);
  save(false);
}

document.getElementById(
    'currentDateDisplay')
  .innerText = today
  .toLocaleDateString(
    'en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });

let lineChart, barChart;

function toggleTheme() {
  const body = document.body;
  const isDark = body
    .classList.contains(
      'dark-theme');
  const themeIcon = document
    .getElementById(
      'themeIcon');
  
  if (isDark) {
    body.classList.replace(
      'dark-theme',
      'light-theme');
    localStorage.setItem(
      'user_theme',
      'light-theme');
    themeIcon.innerText =
      '☀️';
  } else {
    body.classList.replace(
      'light-theme',
      'dark-theme');
    localStorage.setItem(
      'user_theme',
      'dark-theme');
    themeIcon.innerText =
      '🌙';
  }
  
  
  setTimeout(() => {
      requestAnimationFrame
        (() => {
          updateCharts
            ();
        });
    },
    200
  );
}

const savedTheme = localStorage
  .getItem('user_theme') ||
  'dark-theme';

if (savedTheme ===
  'light-theme') {
  document.body.classList
    .replace('dark-theme',
      'light-theme');
  document.getElementById(
      'themeIcon')
    .innerText = '☀️';
}


document.body.className =
  localStorage.getItem(
    'user_theme') ||
  'dark-theme';

function addHabit() {
  const input = document
    .getElementById(
      'habitInput');
  if (!input.value.trim())
    return;
  habits.push({
    id: 'h-' +
      Date.now(),
    text: input
      .value
      .trim()
  });
  input.value = "";
  save();
}

function toggleHabit(id) {
  if (!completionLog[
      todayStr])
    completionLog[
      todayStr] = [];
  const idx = completionLog[
    todayStr].indexOf(
    id);
  idx > -1 ? completionLog[
      todayStr].splice(
      idx, 1) :
    completionLog[todayStr]
    .push(id);
  save();
}

function save(shouldRender =
  true) {
  localStorage.setItem(
    'metrics_v3_habits',
    JSON.stringify(
      habits));
  localStorage.setItem(
    'metrics_v3_log',
    JSON.stringify(
      completionLog));
  localStorage.setItem(
    'metrics_v3_last_date',
    todayDateKey);
  if (shouldRender) render();
}

function render(selectedDay =
  todayStr, isReadOnly = false
) {
  const list = document
    .getElementById(
      'habitList');
  const title = document
    .getElementById(
      'registryTitle');
  const progressText =
    document.getElementById(
      'progressPercent');
  
  title.innerText =
    isReadOnly ?
    `Archive: ${selectedDay}` :
    `Registry: Today`;
  const total = habits.length;
  const doneCount =
    completionLog[
      selectedDay]
    ?.length || 0;
  const percent = total > 0 ?
    Math.round((doneCount /
      total) * 100) : 0;
  progressText.innerText =
    `${percent}%`;
  
  if (habits.length === 0) {
    list.innerHTML =
      `<div class="p-10 border-[3px] border-dashed border-slate-500/10 rounded-3xl text-center opacity-100 text-xs italic">No metrics defined. Add one above to start.</div>`;
  } else {
    list.innerHTML = habits
      .map(h => {
        const
          isDone =
          completionLog[
            selectedDay
          ]
          ?.includes(
            h.id
          );
        return `
<div class="habit-wrapper" 
     ontouchstart="handleTouchStart(event)" 
     ontouchmove="handleTouchMove(event, '${h.id}')"
     ontouchend="handleTouchEnd(event, '${h.id}')">
    
    <div class="swipe-action action-edit">Edit</div>
    <div class="swipe-action action-delete">Delete</div>

    <div id="card-${h.id}" class="habit-content habit-item flex items-center justify-between p-4 glass-card rounded-2xl ${isDone ? 'completed' : ''}">
        <div class="flex items-center gap-4">
            <button ${isReadOnly ? 'disabled' : `onclick="toggleHabit('${h.id}')"`} 
                class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isDone ? 'bg-indigo-500 border-indigo-500 scale-110' : 'border-slate-500/30'}">
                ${isDone ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}
            </button>
            <div>
                <p class="text-sm font-semibold tracking-tight ${isDone ? 'opacity-30 line-through' : ''}">${h.text}</p>
                <p class="text-[9px] font-bold uppercase tracking-tighter ${isDone ? 'text-indigo-500' : 'opacity-20'}">${isDone ? 'Metric Captured' : 'Pending'}</p>
            </div>
        </div>
    </div>
</div>`;
      }).join('') + (
        isReadOnly ?
        `<button onclick="render()" class="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:bg-indigo-500/5 rounded-xl transition-all mt-2">← Return to Today</button>` :
        '');
  }
  updateCharts();
}

let startX = 0;
let startY = 0;
let isDragging = false;
let isScrolling = false;
let directionCaptured =
  false;

function handleTouchStart(e) {
  startX = e.touches[0]
    .clientX;
  startY = e.touches[0]
    .clientY;
  isDragging = true;
  isScrolling = false;
  directionCaptured =
    false; // Reset for new touch
  
  const card = e.currentTarget
    .querySelector(
      '.habit-content');
  card.style.transition =
    'none';
}

function handleTouchMove(e,
  id) {
  if (!isDragging ||
    isScrolling) return;
  
  const currentX = e.touches[
    0].clientX;
  const currentY = e.touches[
    0].clientY;
  
  const diffX = currentX -
    startX;
  const diffY = currentY -
    startY;
  if (!directionCaptured) {
    if (Math.abs(diffX) >
      10) {
      directionCaptured =
        true;
      isScrolling = false;
      isDragging = true;
    } else if (Math.abs(
        diffY) > 10) {
      directionCaptured =
        true;
      isScrolling = true;
      isDragging = false;
      return;
    } else {
      return;
    }
  }
  
  const card = document
    .getElementById(
      `card-${id}`);
  const wrapper = card
    .parentElement;
  const translateX = Math.max(
    Math.min(diffX,
      120), -120);
  
  const editLabel = wrapper
    .querySelector(
      '.action-edit');
  const deleteLabel = wrapper
    .querySelector(
      '.action-delete');
  
  if (translateX > 20) {
    editLabel.style
      .opacity = '1';
    deleteLabel.style
      .opacity = '0';
  } else if (translateX < -
    20) {
    deleteLabel.style
      .opacity = '1';
    editLabel.style
      .opacity = '0';
  }
  
  card.style.transform =
    `translateX(${translateX}px)`;
  
  if (isDragging) {
    e.preventDefault();
  }
}

function handleTouchEnd(e, id) {
  isDragging = false;
  const card = document
    .getElementById(
      `card-${id}`);
  const wrapper = card
    .parentElement;
  
  if (isScrolling) {
    resetCard(card,
      wrapper);
    return;
  }
  
  card.style.transition =
    'all 0.2s ease';
  
  const style = window
    .getComputedStyle(card);
  const matrix =
    new WebKitCSSMatrix(
      style.transform);
  const diff = matrix.m41;
  
  if (diff > 80) {
    card.style.transform =
      'translateX(100px)';
    setTimeout(() =>
      openEditModal(
        id), 200);
  } else if (diff < -80) {
    card.style.transform =
      'translateX(-100px)';
    setTimeout(() =>
      openDeleteModal(
        id), 200);
  } else {
    resetCard(card,
      wrapper);
  }
  resetCard(card, wrapper)
  directionCaptured = false;
  
}


function resetCard(card,
  wrapper) {
  card.style.transform =
    'translateX(0)';
  if (wrapper.querySelector(
      '.action-edit')) {
    wrapper.querySelector(
        '.action-edit')
      .style.opacity =
      '0';
    wrapper.querySelector(
        '.action-delete'
      ).style
      .opacity = '0';
  }
}


// New Edit Feature
function openEditModal(id) {
  const habit = habits.find(
    h => h.id === id);
  const modal = document
    .getElementById(
      'confirmModal');
  const modalContent =
    document.getElementById(
      'modalContent');
  
  // Force standard modal styling
  modalContent.className =
    "glass-card max-w-[340px] w-full p-6 rounded-2xl text-left border-white/10 shadow-2xl";
  
  modalContent.innerHTML = `
        <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-1">Protocol Modification</h4>
        <p class="text-[10px] opacity-40 uppercase tracking-widest">Adjusting Metric ID: ${id.split('-')[1].substring(0,4)}</p>
        
        <input id="editInput" type="text" value="${habit.text}" 
            class="edit-input-field font-medium tracking-tight">
        
        <div class="flex gap-3">
            <button onclick="closeModal()" class="flex-1 py-2 rounded-xl bg-slate-500/10 text-[9px] font-black uppercase tracking-widest">Cancel</button>
            <button onclick="saveEdit('${id}')" class="flex-1 py-4 rounded-xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">Sync Change</button>
        </div>
    `;
  modal.classList.remove(
    'hidden');
  document.getElementById(
    'editInput').focus();
}

function saveEdit(id) {
  const val = document
    .getElementById(
      'editInput').value
    .trim();
  if (val) {
    const idx = habits
      .findIndex(h => h
        .id === id);
    habits[idx].text = val;
    save();
    closeModal();
  }
}


function checkWeeklyReset() {
  const now = new Date();
  const currentSunday =
    new Date(now);
  currentSunday.setDate(now
    .getDate() - now
    .getDay());
  currentSunday.setHours(0, 0,
    0, 0);
  
  const currentWeekId =
    currentSunday
    .toLocaleDateString(
      'en-CA'
    );
  if (lastReportDate ===
    currentWeekId) {
    return;
    
  }
  
  
  const totalCompleted =
    weekDays.reduce((sum,
      day) => {
      return sum + (
        completionLog[
          day]
        ?.length ||
        0);
    }, 0);
  
  if (totalCompleted > 0) {
    
    showWeeklyReport(
      currentWeekId);
  } else {
    
    localStorage.setItem(
      'metrics_v3_last_report',
      currentWeekId);
    lastReportDate =
      currentWeekId;
  }
}

function showWeeklyReport(
  sundayDateStr) {
  // 1. Strictly mark as seen immediately
  localStorage.setItem(
    'metrics_v3_last_report',
    sundayDateStr);
  lastReportDate =
    sundayDateStr;
  
  const dailyStats = weekDays
    .map(day => (
      completionLog[
        day]
      ?.length || 0));
  const totalCompleted =
    dailyStats.reduce((a,
      b) => a + b, 0);
  
  // 2. Prevent empty report logic
  if (totalCompleted === 0 &&
    habits.length === 0)
    return;
  
  const totalPossible = habits
    .length * 7;
  const score =
    totalPossible > 0 ? Math
    .round((totalCompleted /
        totalPossible) *
      100) : 0;
  const avgPerDay = (
      totalCompleted / 7)
    .toFixed(1);
  
  // Status Logic
  let [status, statusColor] =
  score >= 85 ? ["OPTIMAL",
      "text-emerald-400"
    ] :
    score >= 50 ? ["STABLE",
      "text-indigo-400"
    ] : ["CRITICAL",
      "text-red-400"
    ];
  
  const modal = document
    .getElementById(
      'confirmModal');
  const modalContent =
    document.getElementById(
      'modalContent');
  modalContent.className =
    "glass-card w-[92vw] md:w-[420px] rounded-2xl border-white/10 shadow-2xl relative text-left overflow-hidden";
  
  modalContent.innerHTML = `
        <div class="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div>
                <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Weekly Audit</h4>
                <p class="text-[7px] font-mono opacity-30">REF_ID: ${Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            </div>
            <div class="px-2 py-1 rounded bg-black/40 border border-white/5">
                <span class="text-[9px] font-black tracking-widest ${statusColor}">${status}</span>
            </div>
        </div>

        <div class="p-5 space-y-6">
            <div class="grid grid-cols-3 gap-3">
                ${renderStatCard(score + '%', 'Efficiency')}
                ${renderStatCard(totalCompleted, 'Units')}
                ${renderStatCard(avgPerDay, 'Avg/Day')}
            </div>

            <div class="space-y-4">
                <div class="bg-black/20 rounded-xl p-3 border border-white/5">
                    <p class="text-[7px] font-black uppercase opacity-20 mb-3 tracking-widest">Consistency Vector</p>
                    <div class="h-32 w-full"><canvas id="modalLineChart"></canvas></div>
                </div>
                <div class="bg-black/20 rounded-xl p-3 border border-white/5">
                    <p class="text-[7px] font-black uppercase opacity-20 mb-3 tracking-widest">Volume Distribution</p>
                    <div class="h-24 w-full"><canvas id="modalBarChart"></canvas></div>
                </div>
            </div>

            <button onclick="confirmWeeklyReset('${sundayDateStr}', ${score})" 
                class="w-full py-4 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20">
                Reset
            </button>
        </div>
    `;
  
  modal.classList.remove(
    'hidden');
  setTimeout(() =>
    generateDetailedModalCharts(
      dailyStats), 150
  );
}

function renderStatCard(val,
  label) {
  return `
        <div class="bg-white/5 py-3 rounded-xl border border-white/5 text-center">
            <div class="text-xl font-light tracking-tighter text-white">${val}</div>
            <p class="text-[7px] font-bold uppercase opacity-30 tracking-tighter">${label}</p>
        </div>
    `;
}


function generateDetailedModalCharts(
  data) {
  const isDark = document.body
    .classList.contains(
      'dark-theme');
  const accent = '#6366f1';
  
  const chartConfig = (type,
    ctxId, color, fill =
    false) => {
    const ctx = document
      .getElementById(
        ctxId)
      .getContext(
        '2d');
    let bg = color;
    if (fill) {
      const grad = ctx
        .createLinearGradient(
          0, 0, 0,
          150);
      grad.addColorStop(
        0,
        'rgba(99, 102, 241, 0.3)'
      );
      grad.addColorStop(
        1,
        'rgba(99, 102, 241, 0)'
      );
      bg = grad;
    }
    
    return new Chart(
      ctx, {
        type: type,
        data: {
          labels: weekDays
            .map(
              d =>
              d
              .substring(
                0,
                1
              )
            ),
          datasets: [{
            data: data,
            borderColor: color,
            backgroundColor: bg,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: color,
            borderRadius: 4,
            fill: fill
          }]
        },
        options: {
          plugins: {
            legend: { display: false },
            datalabels: { display: false }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: 'rgba(255,255,255,0.2)',
                font: {
                  size: 8,
                  weight: 'bold'
                }
              }
            },
            y: {
              display: false,
              beginAtZero: true,
              suggestedMax: Math
                .max(
                  ...
                  data
                ) +
                1
            }
          },
          maintainAspectRatio: false,
          responsive: true
        }
      });
  };
  
  chartConfig('line',
    'modalLineChart',
    accent, true);
  chartConfig('bar',
    'modalBarChart',
    '#10b981');
}

function confirmWeeklyReset(
  sundayDateStr,
  currentScore = 0) {
  completionLog = {};
  weekDays.forEach(day =>
    completionLog[
      day] = []);
  
  localStorage.setItem(
    'metrics_v3_log',
    JSON.stringify(
      completionLog));
  localStorage.setItem(
    'metrics_v3_last_report',
    sundayDateStr);
  
  //EFFICIENCY MATRIX LOGIC
  let weeklyHistory = JSON
    .parse(localStorage
      .getItem(
        'metrics_v3_history'
      )) || [];
  weeklyHistory.push(
    currentScore);
  localStorage.setItem(
    'metrics_v3_history',
    JSON.stringify(
      weeklyHistory));
  renderEfficiencyCubes();
  save();
  closeModal();
}

function openDeleteModal(id) {
  const modal = document
    .getElementById(
      'confirmModal');
  document.getElementById(
      'modalContent')
    .innerHTML = `
                <h3 class="font-bold mb-4">Remove this metric?</h3>
                <div class="flex gap-3">
                    <button onclick="closeModal()" class="flex-1 py-2 rounded-lg bg-slate-500/10 text-xs font-bold uppercase">Cancel</button>
                    <button id="confirmDeleteBtn" class="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold uppercase">Delete</button>
                </div>
            `;
  document.getElementById(
      'confirmDeleteBtn')
    .onclick = () => {
      habits = habits
        .filter(h => h
          .id !== id);
      weekDays.forEach(
        d => {
          if (
            completionLog[
              d
            ]
          )
            completionLog[
              d
            ] =
            completionLog[
              d
            ]
            .filter(
              cid =>
              cid !==
              id
            );
        }
      );
      save();
      closeModal();
    };
  modal.classList.remove(
    'hidden');
}

function closeModal() {
  document
    .getElementById(
      'confirmModal')
    .classList.add(
      'hidden');
  
  
}

function updateCharts() {
  const isDark = document.body
    .classList.contains(
      'dark-theme');
  const labelColor = isDark ?
    '#475569' : '#94A3B8';
  const gridColor = isDark ?
    'rgba(255,255,255,0.02)' :
    'rgba(0,0,0,0.02)';
  
  const lineData = weekDays
    .map((d, i) => (i >
      today.getDay() ?
      null : (
        completionLog[
          d]
        ?.length ||
        0)));
  const barData = weekDays
    .map(d => (
      completionLog[d]
      ?.length || 0));
  const maxValue = Math.max(
    ...barData, 0);
  const dynamicMax = Math.max(
    5, maxValue + 1);
  const chartOptions = {
    animation: {
      duration: chartsLoaded ?
        1000 : 0
    },
    onClick: (e,
      el) => {
      if (el
        .length >
        0)
        render(
          weekDays[
            el[
              0
            ]
            .index
          ],
          weekDays[
            el[
              0
            ]
            .index
          ] !==
          todayStr
        );
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        color: isDark ?
          '#FFF' : '#000',
        anchor: 'end',
        align: 'top',
        font: {
          weight: 'bold',
          size: 10
        },
        offset: 4
      }
    },
    scales: {
      y: {
        grid: { color: gridColor },
        ticks: {
          color: labelColor,
          font: { size: 9 },
          stepSize: 1
        },
        beginAtZero: true,
        max: dynamicMax,
        suggestedMax: 5,
        border: { display: false }
      },
      x: {
        offset: true,
        grid: { display: false },
        ticks: {
          color: labelColor,
          font: { size: 9 }
        },
        border: { display: false }
      }
    },
    maintainAspectRatio: false,
    responsive: true
  };
  
  const ctxL = document
    .getElementById(
      'lineChart')
    .getContext('2d');
  if (lineChart) lineChart
    .destroy();
  lineChart = new Chart(
    ctxL, {
      type: 'line',
      data: {
        labels: weekDays
          .map(
            d =>
            d
            .substring(
              0,
              3
            )
          ),
        datasets: [{
          data: lineData,
          pointBackgroundColor: '#6366f1',
          borderColor: '#6366f1',
          borderWidth: 3,
          tension: 0,
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.1)'
        }]
      },
      options: chartOptions
    });
  
  
  const ctxB = document
    .getElementById(
      'barChart')
    .getContext('2d');
  if (barChart) barChart
    .destroy();
  barChart = new Chart(ctxB, {
    type: 'bar',
    data: {
      labels: weekDays
        .map(
          d =>
          d
          .substring(
            0,
            3
          )
        ),
      datasets: [{
        data: barData,
        backgroundColor: '#10b981',
        borderRadius: 6,
        barThickness: 20
      }]
    },
    options: chartOptions
  });
}

function renderEfficiencyCubes() {
  let weeklyHistory = JSON
    .parse(localStorage
      .getItem(
        'metrics_v3_history'
      )) || [];
  const grid = document
    .getElementById(
      'efficiencyGrid');
  if (!grid) return;
  
  let totalCubes = 10 + Math
    .floor(weeklyHistory
      .length / 4) * 4;
  
  let html = '';
  for (let i = 0; i <
    totalCubes; i++) {
    if (i < weeklyHistory
      .length) {
      const score =
        weeklyHistory[
          i];
      
      const hue = Math
        .floor((score /
            100) *
          120);
      const color =
        `hsl(${hue}, 70%, 50%)`;
      const shadow =
        `0 0 10px hsla(${hue}, 70%, 50%, 0.3)`;
      
      html +=
        `<div class="w-7 h-7 md:w-8 md:h-8 rounded-lg cursor-default shadow-sm transition-all duration-300 hover:scale-110 hover:z-10" 
                                  style="background-color: ${color}; box-shadow: ${shadow};" 
                                  title="Week ${i + 1} Vector: ${score}%"></div>`;
    } else {
      html +=
        `<div class="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[var(--border)] transition-all duration-300"></div>`;
    }
  }
  grid.innerHTML = html;
}


const quotes = [
  "The system only works if you do.",
  "Excellence is not an act, but a habit.",
  "Small wins are the coordinates to breakthroughs.",
  "Discipline is the bridge to accomplishment.",
  "Do not break the chain of consistency.",
  "Data reveals truth; effort creates result.",
  "Your mindset is everything."
];

function updateDailyQuote() {
  document.getElementById(
      'quoteText')
    .innerText =
    `"${quotes[today.getDate() % quotes.length]}"`;
}

//Browsers Checker
window.addEventListener(
  'DOMContentLoaded', (event) => {
    const userAgent = navigator
      .userAgent || navigator
      .vendor || window.opera;
    const promoContainer = document
      .getElementById(
        'appPromoContainer');
    const isWebView = userAgent
      .includes("; wv");
    setInterval(() => {
      
      if (!isWebView) {
        promoContainer.style
          .display =
          "flex";
      }
    }, 2000)
  });

updateDailyQuote();
renderEfficiencyCubes();
checkWeeklyReset();
render();