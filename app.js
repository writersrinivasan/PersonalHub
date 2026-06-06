// ============================================================
// UTILITIES
// ============================================================
const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const fmt = d => d instanceof Date ? d.toISOString().split('T')[0] : d;
const today = () => fmt(new Date());
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };
const daysAhead = n => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d); };
const formatCurrency = n => '₹' + Number(n).toLocaleString('en-IN');
const formatDate = s => { if (!s) return ''; const d = new Date(s + 'T00:00:00'); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };
const escape = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const DB = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  getObj: k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } },
  setObj: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

// ============================================================
// SAMPLE DATA
// ============================================================
function initSampleData() {
  if (localStorage.getItem('ph_initialized')) return;

  DB.set('tasks', [
    { id: uid(), title: 'Review Q2 financial report', type: 'professional', status: 'todo', priority: 'high', dueDate: daysAhead(2), startTime: '09:00', endTime: '10:00', description: 'Go through Q2 numbers with the team', category: 'Finance' },
    { id: uid(), title: 'Client presentation prep', type: 'professional', status: 'in-progress', priority: 'high', dueDate: daysAhead(1), startTime: '14:00', endTime: '15:30', description: 'Prepare slides for client demo', category: 'Sales' },
    { id: uid(), title: 'Morning workout', type: 'personal', status: 'todo', priority: 'medium', dueDate: today(), startTime: '06:30', endTime: '07:30', description: '', category: 'Health' },
    { id: uid(), title: 'Monthly budget review', type: 'personal', status: 'todo', priority: 'medium', dueDate: daysAhead(3), startTime: '20:00', endTime: '21:00', description: 'Review personal finances for the month', category: 'Finance' },
    { id: uid(), title: 'Team standup', type: 'professional', status: 'done', priority: 'low', dueDate: daysAgo(1), startTime: '09:45', endTime: '10:00', description: '', category: 'Management' },
    { id: uid(), title: 'Read: Atomic Habits (ch. 8–12)', type: 'personal', status: 'in-progress', priority: 'low', dueDate: daysAhead(7), startTime: '21:00', endTime: '22:00', description: '', category: 'Learning' },
    { id: uid(), title: 'Send invoice to Client XYZ', type: 'professional', status: 'todo', priority: 'high', dueDate: today(), startTime: '11:00', endTime: '11:30', description: '', category: 'Finance' },
    { id: uid(), title: 'Doctor appointment follow-up', type: 'personal', status: 'done', priority: 'medium', dueDate: daysAgo(2), startTime: '10:00', endTime: '10:30', description: '', category: 'Health' },
    { id: uid(), title: 'Update project proposal', type: 'professional', status: 'in-progress', priority: 'medium', dueDate: daysAhead(4), startTime: '15:00', endTime: '17:00', description: '', category: 'Projects' },
    { id: uid(), title: 'Family dinner plan', type: 'personal', status: 'todo', priority: 'low', dueDate: daysAhead(5), startTime: '19:00', endTime: '21:00', description: '', category: 'Personal' },
  ]);

  DB.set('personal_expenses', [
    { id: uid(), description: 'Grocery shopping', amount: 3500, category: 'Food', date: daysAgo(1), paymentMethod: 'UPI', notes: '' },
    { id: uid(), description: 'Electricity bill', amount: 2200, category: 'Utilities', date: daysAgo(3), paymentMethod: 'Online', notes: '' },
    { id: uid(), description: 'Netflix subscription', amount: 649, category: 'Entertainment', date: daysAgo(5), paymentMethod: 'Credit Card', notes: '' },
    { id: uid(), description: 'Petrol', amount: 1800, category: 'Transport', date: daysAgo(2), paymentMethod: 'Cash', notes: '' },
    { id: uid(), description: 'Gym membership', amount: 2000, category: 'Health', date: daysAgo(10), paymentMethod: 'UPI', notes: '' },
    { id: uid(), description: 'Restaurant dinner', amount: 1200, category: 'Food', date: daysAgo(4), paymentMethod: 'UPI', notes: '' },
    { id: uid(), description: 'Phone recharge', amount: 599, category: 'Utilities', date: daysAgo(8), paymentMethod: 'UPI', notes: '' },
    { id: uid(), description: 'Clothing', amount: 3200, category: 'Shopping', date: daysAgo(12), paymentMethod: 'Credit Card', notes: '' },
    { id: uid(), description: 'Online course', amount: 1999, category: 'Education', date: daysAgo(6), paymentMethod: 'UPI', notes: '' },
  ]);

  DB.set('professional_expenses', [
    { id: uid(), description: 'Adobe Creative Cloud', amount: 5200, category: 'Software', date: daysAgo(2), paymentMethod: 'Credit Card', taxDeductible: true, notes: '' },
    { id: uid(), description: 'Client lunch meeting', amount: 2800, category: 'Business Meals', date: daysAgo(5), paymentMethod: 'Credit Card', taxDeductible: true, notes: '' },
    { id: uid(), description: 'Domain renewal', amount: 1200, category: 'Software', date: daysAgo(7), paymentMethod: 'Credit Card', taxDeductible: true, notes: '' },
    { id: uid(), description: 'Coworking space – June', amount: 8000, category: 'Office', date: daysAgo(6), paymentMethod: 'Bank Transfer', taxDeductible: true, notes: '' },
    { id: uid(), description: 'LinkedIn Premium', amount: 2000, category: 'Marketing', date: daysAgo(10), paymentMethod: 'Credit Card', taxDeductible: true, notes: '' },
    { id: uid(), description: 'Zoom Pro subscription', amount: 1300, category: 'Software', date: daysAgo(15), paymentMethod: 'Credit Card', taxDeductible: true, notes: '' },
  ]);

  DB.set('revenue', [
    { id: uid(), source: 'Client A – Website Project', amount: 75000, category: 'Freelance', date: daysAgo(5), isRecurring: false, frequency: '', notes: '' },
    { id: uid(), source: 'Monthly Retainer – Client B', amount: 35000, category: 'Retainer', date: daysAgo(1), isRecurring: true, frequency: 'monthly', notes: '' },
    { id: uid(), source: 'Consulting – Client C', amount: 25000, category: 'Consulting', date: daysAgo(8), isRecurring: false, frequency: '', notes: '' },
    { id: uid(), source: 'Stock dividends', amount: 8500, category: 'Investment', date: daysAgo(12), isRecurring: false, frequency: '', notes: '' },
    { id: uid(), source: 'Course sales', amount: 12000, category: 'Digital Products', date: daysAgo(3), isRecurring: false, frequency: '', notes: '' },
    { id: uid(), source: 'Referral bonus', amount: 5000, category: 'Bonus', date: daysAgo(9), isRecurring: false, frequency: '', notes: '' },
  ]);

  DB.set('client_bookings', [
    { id: uid(), clientName: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', service: 'Strategy Consultation', date: daysAhead(2), startTime: '10:00', endTime: '11:00', status: 'confirmed', notes: 'Discuss Q3 growth plan' },
    { id: uid(), clientName: 'Priya Menon', email: 'priya@example.com', phone: '9123456780', service: 'Website Review', date: daysAhead(4), startTime: '14:00', endTime: '15:00', status: 'pending', notes: '' },
    { id: uid(), clientName: 'TechCorp Ltd', email: 'contact@techcorp.com', phone: '9988776655', service: 'Monthly Check-in', date: daysAgo(1), startTime: '11:00', endTime: '11:30', status: 'completed', notes: 'Great call, follow up needed' },
    { id: uid(), clientName: 'Anjali Singh', email: 'anjali@startup.io', phone: '9871234567', service: 'Brand Strategy', date: daysAhead(6), startTime: '15:00', endTime: '16:30', status: 'confirmed', notes: 'New client onboarding' },
  ]);

  localStorage.setItem('ph_initialized', '1');
  localStorage.setItem('ph_user', 'Srinivasan');
}

// ============================================================
// STATE
// ============================================================
let currentView = 'dashboard';
let calendarDate = new Date();
let taskFilter = 'all';
let chartInstances = {};

// ============================================================
// ROUTER
// ============================================================
function navigate(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });
  const titles = {
    dashboard: ['Dashboard', 'Welcome back, ' + (localStorage.getItem('ph_user') || 'there') + '! Here\'s your overview.'],
    schedule: ['Calendar', 'Your schedule at a glance'],
    tasks: ['Tasks', 'Manage personal & professional tasks'],
    'client-bookings': ['Client Bookings', 'Manage your client calendar'],
    'personal-expenses': ['Personal Expenses', 'Track your personal spending'],
    'professional-expenses': ['Business Expenses', 'Track business & tax-deductible expenses'],
    revenue: ['Revenue', 'Track income from all sources'],
    pnl: ['P&L Calculator', 'Profit & loss overview']
  };
  const [title, subtitle] = titles[view] || ['', ''];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = subtitle;

  const vc = document.getElementById('view-container');
  vc.innerHTML = '';
  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};

  const views = {
    dashboard: renderDashboard,
    schedule: renderSchedule,
    tasks: renderTasks,
    'client-bookings': renderClientBookings,
    'personal-expenses': () => renderExpenses('personal'),
    'professional-expenses': () => renderExpenses('professional'),
    revenue: renderRevenue,
    pnl: renderPnL
  };
  if (views[view]) {
    vc.innerHTML = `<div class="fade-in">${views[view]()}</div>`;
    afterRender(view);
  }
}

function afterRender(view) {
  if (view === 'dashboard') initDashboardCharts();
  if (view === 'schedule') bindCalendarNav();
  if (view === 'revenue') initRevenueChart();
  if (view === 'personal-expenses' || view === 'professional-expenses') initExpenseChart(view === 'personal-expenses' ? 'personal' : 'professional');
  if (view === 'pnl') initPnLChart();
}

// ============================================================
// VIEW: DASHBOARD
// ============================================================
function renderDashboard() {
  const tasks = DB.get('tasks');
  const personalExp = DB.get('personal_expenses');
  const profExp = DB.get('professional_expenses');
  const revenue = DB.get('revenue');
  const bookings = DB.get('client_bookings');

  const todayTasks = tasks.filter(t => t.dueDate === today() && t.status !== 'done');
  const weekEnd = daysAhead(7);
  const weekTasks = tasks.filter(t => t.dueDate >= today() && t.dueDate <= weekEnd && t.status !== 'done');
  const monthRevenue = revenue.reduce((s, r) => s + Number(r.amount), 0);
  const monthPersonalExp = personalExp.reduce((s, e) => s + Number(e.amount), 0);
  const monthProfExp = profExp.reduce((s, e) => s + Number(e.amount), 0);
  const totalExp = monthPersonalExp + monthProfExp;
  const netPL = monthRevenue - totalExp;
  const upcomingBookings = bookings.filter(b => b.date >= today() && b.status !== 'cancelled').slice(0, 3);
  const recentTasks = tasks.filter(t => t.status !== 'done').sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);

  return `
  <div class="grid grid-cols-4 gap-4 mb-6">
    ${statCard('Tasks Today', todayTasks.length, 'bg-indigo-50', '#4f46e5', svgTask(), todayTasks.length === 0 ? 'All done!' : `${todayTasks.length} pending`)}
    ${statCard('Due This Week', weekTasks.length, 'bg-purple-50', '#7c3aed', svgCalendar(), 'tasks upcoming')}
    ${statCard('Total Revenue', formatCurrency(monthRevenue), 'bg-green-50', '#059669', svgMoney(), 'this month')}
    ${statCard('Net P&L', formatCurrency(netPL), netPL >= 0 ? 'bg-green-50' : 'bg-red-50', netPL >= 0 ? '#059669' : '#dc2626', svgChart(), netPL >= 0 ? 'Profit ↑' : 'Loss ↓')}
  </div>

  <div class="grid grid-cols-3 gap-4 mb-6">
    <div class="col-span-2 card">
      <div class="card-header">
        <span class="section-title">Revenue vs Expenses</span>
        <span class="text-xs text-gray-400">This month</span>
      </div>
      <div class="card-body">
        <canvas id="chart-overview" height="120"></canvas>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="section-title">Task Status</span></div>
      <div class="card-body flex flex-col items-center">
        <canvas id="chart-tasks" width="160" height="160"></canvas>
        <div class="flex gap-4 mt-3 text-xs">
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>To Do</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>In Progress</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Done</span>
        </div>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div class="card">
      <div class="card-header">
        <span class="section-title">Upcoming Tasks</span>
        <button onclick="navigate('tasks')" class="text-xs text-indigo-600 font-semibold hover:underline">View all</button>
      </div>
      <div class="card-body p-0">
        ${recentTasks.length === 0 ? '<div class="empty-state">No pending tasks</div>' :
          recentTasks.map(t => `
          <div class="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer" onclick="navigate('tasks')">
            <div class="w-2 h-2 rounded-full flex-shrink-0 ${t.type === 'personal' ? 'bg-indigo-400' : 'bg-green-400'}"></div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-800 truncate">${escape(t.title)}</div>
              <div class="text-xs text-gray-400">${formatDate(t.dueDate)} · ${t.startTime || ''}</div>
            </div>
            <span class="badge badge-${t.priority}">${t.priority}</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="section-title">Upcoming Client Bookings</span>
        <button onclick="navigate('client-bookings')" class="text-xs text-indigo-600 font-semibold hover:underline">View all</button>
      </div>
      <div class="card-body p-0">
        ${upcomingBookings.length === 0 ? '<div class="empty-state">No upcoming bookings</div>' :
          upcomingBookings.map(b => `
          <div class="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer" onclick="navigate('client-bookings')">
            <div class="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">${escape(b.clientName[0])}</div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-800 truncate">${escape(b.clientName)}</div>
              <div class="text-xs text-gray-400">${escape(b.service)} · ${formatDate(b.date)} ${b.startTime}</div>
            </div>
            <span class="badge badge-${b.status}">${b.status}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function statCard(label, value, iconBg, iconColor, icon, sub) {
  return `<div class="stat-card">
    <div class="flex items-start justify-between mb-3">
      <div class="stat-icon ${iconBg}" style="color:${iconColor}">${icon}</div>
    </div>
    <div class="text-2xl font-bold text-gray-800">${value}</div>
    <div class="text-sm text-gray-500 mt-0.5">${label}</div>
    <div class="text-xs mt-1 font-medium" style="color:${iconColor}">${sub}</div>
  </div>`;
}

function initDashboardCharts() {
  const tasks = DB.get('tasks');
  const todo = tasks.filter(t => t.status === 'todo').length;
  const inprog = tasks.filter(t => t.status === 'in-progress').length;
  const done = tasks.filter(t => t.status === 'done').length;

  const revenue = DB.get('revenue').reduce((s,r) => s + Number(r.amount), 0);
  const personalExp = DB.get('personal_expenses').reduce((s,e) => s + Number(e.amount), 0);
  const profExp = DB.get('professional_expenses').reduce((s,e) => s + Number(e.amount), 0);

  const c1 = document.getElementById('chart-overview');
  const c2 = document.getElementById('chart-tasks');
  if (!c1 || !c2) return;

  chartInstances.overview = new Chart(c1, {
    type: 'bar',
    data: {
      labels: ['Revenue', 'Personal Exp', 'Business Exp', 'Net P&L'],
      datasets: [{
        data: [revenue, personalExp, profExp, revenue - personalExp - profExp],
        backgroundColor: [
          'rgba(16,185,129,0.8)', 'rgba(99,102,241,0.8)',
          'rgba(245,158,11,0.8)', revenue - personalExp - profExp >= 0 ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.8)'
        ],
        borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => '₹' + (v/1000).toFixed(0) + 'k' } },
        x: { grid: { display: false } }
      }
    }
  });

  chartInstances.tasks = new Chart(c2, {
    type: 'doughnut',
    data: {
      labels: ['To Do', 'In Progress', 'Done'],
      datasets: [{ data: [todo, inprog, done], backgroundColor: ['#6366f1', '#f59e0b', '#10b981'], borderWidth: 0, hoverOffset: 4 }]
    },
    options: { plugins: { legend: { display: false } }, cutout: '65%' }
  });
}

// ============================================================
// VIEW: SCHEDULE (CALENDAR)
// ============================================================
function renderSchedule() {
  const tasks = DB.get('tasks');
  const bookings = DB.get('client_bookings');
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthName = calendarDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const getEvents = dateStr => {
    const t = tasks.filter(t => t.dueDate === dateStr);
    const b = bookings.filter(b => b.date === dateStr);
    return [...t.map(t => ({ ...t, _kind: 'task' })), ...b.map(b => ({ ...b, _kind: 'booking' }))];
  };

  const todayStr = today();
  let cells = '';
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    let dayNum, dateStr, isOtherMonth = false;
    if (i < firstDay) {
      dayNum = daysInPrevMonth - firstDay + i + 1;
      const d = new Date(year, month - 1, dayNum);
      dateStr = fmt(d); isOtherMonth = true;
    } else if (i >= firstDay + daysInMonth) {
      dayNum = i - firstDay - daysInMonth + 1;
      const d = new Date(year, month + 1, dayNum);
      dateStr = fmt(d); isOtherMonth = true;
    } else {
      dayNum = i - firstDay + 1;
      dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
    }

    const isToday = dateStr === todayStr;
    const events = getEvents(dateStr);
    const evHTML = events.slice(0, 3).map(ev => {
      const cls = ev._kind === 'booking' ? 'client' : ev.type;
      const lbl = ev._kind === 'booking' ? ev.clientName : ev.title;
      return `<div class="cal-event ${cls}">${escape(lbl)}</div>`;
    }).join('') + (events.length > 3 ? `<div class="cal-event" style="color:#9ca3af">+${events.length-3} more</div>` : '');

    cells += `<div class="calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}" onclick="App.addTaskForDate('${dateStr}')">
      <div class="day-num">${dayNum}</div>
      ${evHTML}
    </div>`;
  }

  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d =>
    `<div class="calendar-header-day">${d}</div>`).join('');

  return `
  <div class="flex items-center justify-between mb-5">
    <h2 class="text-lg font-bold text-gray-800">${monthName}</h2>
    <div class="flex gap-2">
      <button class="btn btn-secondary btn-sm" id="cal-prev">← Prev</button>
      <button class="btn btn-secondary btn-sm" id="cal-today">Today</button>
      <button class="btn btn-secondary btn-sm" id="cal-next">Next →</button>
      <button class="btn btn-primary btn-sm" onclick="App.openModal('task')">+ Add Event</button>
    </div>
  </div>
  <div class="card">
    <div class="grid grid-cols-7">${dayLabels}</div>
    <div class="calendar-grid">${cells}</div>
  </div>
  <div class="mt-4 flex gap-4 text-xs text-gray-500">
    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-indigo-200 inline-block"></span>Personal</span>
    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-green-200 inline-block"></span>Professional</span>
    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-purple-200 inline-block"></span>Client</span>
  </div>`;
}

function bindCalendarNav() {
  document.getElementById('cal-prev')?.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    navigate('schedule');
  });
  document.getElementById('cal-next')?.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    navigate('schedule');
  });
  document.getElementById('cal-today')?.addEventListener('click', () => {
    calendarDate = new Date();
    navigate('schedule');
  });
}

// ============================================================
// VIEW: TASKS (KANBAN)
// ============================================================
function renderTasks() {
  const tasks = DB.get('tasks');
  const filtered = taskFilter === 'all' ? tasks : tasks.filter(t => t.type === taskFilter);

  const cols = [
    { id: 'todo', label: 'To Do', color: '#6366f1', bg: '#f5f3ff' },
    { id: 'in-progress', label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
    { id: 'done', label: 'Done', color: '#10b981', bg: '#f0fdf4' }
  ];

  return `
  <div class="filter-tabs">
    <button class="filter-tab ${taskFilter==='all'?'active':''}" onclick="App.setTaskFilter('all')">All Tasks</button>
    <button class="filter-tab ${taskFilter==='personal'?'active':''}" onclick="App.setTaskFilter('personal')">Personal</button>
    <button class="filter-tab ${taskFilter==='professional'?'active':''}" onclick="App.setTaskFilter('professional')">Professional</button>
    <button class="btn btn-primary btn-sm ml-auto" onclick="App.openModal('task')">+ Add Task</button>
  </div>
  <div class="grid grid-cols-3 gap-4">
    ${cols.map(col => {
      const colTasks = filtered.filter(t => t.status === col.id);
      return `
      <div class="kanban-col" style="background:${col.bg}">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full" style="background:${col.color}"></div>
            <span class="font-bold text-sm text-gray-700">${col.label}</span>
            <span class="bg-white text-gray-500 text-xs font-semibold px-1.5 py-0.5 rounded-full">${colTasks.length}</span>
          </div>
        </div>
        ${colTasks.length === 0 ? `<div class="text-xs text-center text-gray-400 py-4">No tasks here</div>` :
          colTasks.map(t => taskCard(t)).join('')}
      </div>`;
    }).join('')}
  </div>`;
}

function taskCard(t) {
  return `<div class="task-card ${t.type}" onclick="App.editTask('${t.id}')">
    <div class="flex items-start justify-between gap-2 mb-2">
      <div class="text-sm font-semibold text-gray-800 leading-snug">${escape(t.title)}</div>
      <span class="badge badge-${t.priority} flex-shrink-0">${t.priority}</span>
    </div>
    ${t.description ? `<div class="text-xs text-gray-400 mb-2 line-clamp-2">${escape(t.description)}</div>` : ''}
    <div class="flex items-center justify-between mt-2">
      <div class="flex gap-1.5">
        <span class="badge badge-${t.type}">${t.type}</span>
        ${t.category ? `<span class="badge" style="background:#f3f4f6;color:#6b7280">${escape(t.category)}</span>` : ''}
      </div>
      <div class="text-xs text-gray-400">${formatDate(t.dueDate)}</div>
    </div>
    ${t.startTime ? `<div class="text-xs text-gray-400 mt-1">⏰ ${t.startTime}${t.endTime ? ' – '+t.endTime : ''}</div>` : ''}
  </div>`;
}

// ============================================================
// VIEW: EXPENSES
// ============================================================
function renderExpenses(type) {
  const expenses = DB.get(type === 'personal' ? 'personal_expenses' : 'professional_expenses');
  const total = expenses.reduce((s,e) => s + Number(e.amount), 0);
  const taxTotal = type === 'professional' ? expenses.filter(e => e.taxDeductible).reduce((s,e) => s + Number(e.amount), 0) : 0;

  const catTotals = {};
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount); });
  const topCat = Object.entries(catTotals).sort((a,b) => b[1]-a[1])[0];

  return `
  <div class="grid grid-cols-3 gap-4 mb-5">
    ${statCard('Total Expenses', formatCurrency(total), 'bg-red-50', '#dc2626', svgMoney(), 'This month')}
    ${statCard('Top Category', topCat ? topCat[0] : 'N/A', 'bg-amber-50', '#d97706', svgTag(), topCat ? formatCurrency(topCat[1]) : '')}
    ${type === 'professional' ? statCard('Tax Deductible', formatCurrency(taxTotal), 'bg-green-50', '#059669', svgCheck(), `${expenses.filter(e=>e.taxDeductible).length} items`) : statCard('Transactions', expenses.length, 'bg-indigo-50', '#4f46e5', svgTask(), 'entries')}
  </div>

  <div class="grid grid-cols-3 gap-4 mb-5">
    <div class="col-span-2 card">
      <div class="card-header">
        <span class="section-title">All ${type === 'personal' ? 'Personal' : 'Business'} Expenses</span>
        <button class="btn btn-primary btn-sm" onclick="App.openModal('${type}-expense')">+ Add Expense</button>
      </div>
      <table class="data-table">
        <thead><tr>
          <th>Description</th><th>Category</th><th>Date</th><th>Payment</th>
          ${type === 'professional' ? '<th>Tax</th>' : ''}
          <th>Amount</th><th></th>
        </tr></thead>
        <tbody>
        ${expenses.length === 0 ? `<tr><td colspan="7" class="text-center text-gray-400 py-8">No expenses yet. Add your first one!</td></tr>` :
          expenses.sort((a,b) => b.date.localeCompare(a.date)).map(e => `
          <tr>
            <td class="font-medium">${escape(e.description)}</td>
            <td><span class="badge" style="background:#f3f4f6;color:#6b7280">${escape(e.category)}</span></td>
            <td class="text-gray-500">${formatDate(e.date)}</td>
            <td class="text-gray-500">${escape(e.paymentMethod)}</td>
            ${type === 'professional' ? `<td>${e.taxDeductible ? '<span class="badge badge-confirmed">✓ Yes</span>' : '<span style="color:#9ca3af">—</span>'}</td>` : ''}
            <td class="font-semibold text-red-600">${formatCurrency(e.amount)}</td>
            <td><button class="btn-icon" onclick="App.deleteItem('${type === 'personal' ? 'personal_expenses' : 'professional_expenses'}','${e.id}','${type === 'personal' ? 'personal-expenses' : 'professional-expenses'}')">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="card">
      <div class="card-header"><span class="section-title">By Category</span></div>
      <div class="card-body">
        <canvas id="chart-expense" width="200" height="200"></canvas>
      </div>
    </div>
  </div>`;
}

function initExpenseChart(type) {
  const expenses = DB.get(type === 'personal' ? 'personal_expenses' : 'professional_expenses');
  const catTotals = {};
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount); });
  const c = document.getElementById('chart-expense');
  if (!c) return;
  const colors = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];
  chartInstances.expense = new Chart(c, {
    type: 'doughnut',
    data: {
      labels: Object.keys(catTotals),
      datasets: [{ data: Object.values(catTotals), backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }]
    },
    options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } } }, cutout: '55%' }
  });
}

// ============================================================
// VIEW: REVENUE
// ============================================================
function renderRevenue() {
  const revenue = DB.get('revenue');
  const total = revenue.reduce((s,r) => s + Number(r.amount), 0);
  const recurring = revenue.filter(r => r.isRecurring).reduce((s,r) => s + Number(r.amount), 0);
  const catMap = {};
  revenue.forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + Number(r.amount); });

  return `
  <div class="grid grid-cols-3 gap-4 mb-5">
    ${statCard('Total Revenue', formatCurrency(total), 'bg-green-50', '#059669', svgMoney(), 'This month')}
    ${statCard('Recurring Income', formatCurrency(recurring), 'bg-indigo-50', '#4f46e5', svgRepeat(), `${revenue.filter(r=>r.isRecurring).length} sources`)}
    ${statCard('Revenue Sources', revenue.length, 'bg-purple-50', '#7c3aed', svgTag(), 'unique entries')}
  </div>

  <div class="grid grid-cols-3 gap-4">
    <div class="col-span-2 card">
      <div class="card-header">
        <span class="section-title">All Revenue</span>
        <button class="btn btn-primary btn-sm" onclick="App.openModal('revenue')">+ Add Revenue</button>
      </div>
      <table class="data-table">
        <thead><tr><th>Source</th><th>Category</th><th>Date</th><th>Recurring</th><th>Amount</th><th></th></tr></thead>
        <tbody>
        ${revenue.length === 0 ? `<tr><td colspan="6" class="text-center text-gray-400 py-8">No revenue entries yet.</td></tr>` :
          revenue.sort((a,b) => b.date.localeCompare(a.date)).map(r => `
          <tr>
            <td class="font-medium">${escape(r.source)}</td>
            <td><span class="badge" style="background:#d1fae5;color:#059669">${escape(r.category)}</span></td>
            <td class="text-gray-500">${formatDate(r.date)}</td>
            <td>${r.isRecurring ? `<span class="badge badge-confirmed">↺ ${escape(r.frequency)}</span>` : '<span class="text-gray-400">—</span>'}</td>
            <td class="font-semibold text-green-600">${formatCurrency(r.amount)}</td>
            <td><button class="btn-icon" onclick="App.deleteItem('revenue','${r.id}','revenue')">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="card">
      <div class="card-header"><span class="section-title">By Category</span></div>
      <div class="card-body">
        <canvas id="chart-revenue" width="200" height="200"></canvas>
      </div>
    </div>
  </div>`;
}

function initRevenueChart() {
  const revenue = DB.get('revenue');
  const catMap = {};
  revenue.forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + Number(r.amount); });
  const c = document.getElementById('chart-revenue');
  if (!c) return;
  const colors = ['#10b981','#6366f1','#f59e0b','#8b5cf6','#06b6d4','#f97316'];
  chartInstances.revenue = new Chart(c, {
    type: 'doughnut',
    data: {
      labels: Object.keys(catMap),
      datasets: [{ data: Object.values(catMap), backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }]
    },
    options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } } }, cutout: '55%' }
  });
}

// ============================================================
// VIEW: P&L CALCULATOR
// ============================================================
function renderPnL() {
  const revenue = DB.get('revenue');
  const personalExp = DB.get('personal_expenses');
  const profExp = DB.get('professional_expenses');

  const totalRevenue = revenue.reduce((s,r) => s + Number(r.amount), 0);
  const totalPersonal = personalExp.reduce((s,e) => s + Number(e.amount), 0);
  const totalProfessional = profExp.reduce((s,e) => s + Number(e.amount), 0);
  const totalExpenses = totalPersonal + totalProfessional;
  const netPL = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? ((netPL / totalRevenue) * 100).toFixed(1) : 0;
  const taxDeductible = profExp.filter(e => e.taxDeductible).reduce((s,e) => s + Number(e.amount), 0);

  const revByCat = {};
  revenue.forEach(r => { revByCat[r.category] = (revByCat[r.category] || 0) + Number(r.amount); });

  return `
  <div class="grid grid-cols-4 gap-4 mb-6">
    ${statCard('Total Revenue', formatCurrency(totalRevenue), 'bg-green-50', '#059669', svgMoney(), `${revenue.length} sources`)}
    ${statCard('Total Expenses', formatCurrency(totalExpenses), 'bg-red-50', '#dc2626', svgTask(), `Personal + Business`)}
    ${statCard('Net P&L', formatCurrency(netPL), netPL >= 0 ? 'bg-green-50' : 'bg-red-50', netPL >= 0 ? '#059669' : '#dc2626', svgChart(), netPL >= 0 ? '↑ Profit' : '↓ Loss')}
    ${statCard('Profit Margin', margin + '%', 'bg-indigo-50', '#4f46e5', svgPercent(), netPL >= 0 ? 'Healthy' : 'Below 0')}
  </div>

  <div class="grid grid-cols-2 gap-4 mb-4">
    <div class="card">
      <div class="card-header"><span class="section-title">Income Statement</span></div>
      <div class="card-body">
        <div class="pnl-row">
          <span class="font-semibold text-green-700">Revenue</span>
          <span class="font-semibold text-green-700">${formatCurrency(totalRevenue)}</span>
        </div>
        ${Object.entries(revByCat).map(([cat, amt]) => `
          <div class="pnl-row pl-4">
            <span class="text-gray-600 text-sm">${escape(cat)}</span>
            <span class="text-gray-600 text-sm">${formatCurrency(amt)}</span>
          </div>`).join('')}

        <div class="pnl-row mt-2">
          <span class="font-semibold text-red-600">Total Expenses</span>
          <span class="font-semibold text-red-600">(${formatCurrency(totalExpenses)})</span>
        </div>
        <div class="pnl-row pl-4">
          <span class="text-gray-600 text-sm">Personal</span>
          <span class="text-gray-600 text-sm">(${formatCurrency(totalPersonal)})</span>
        </div>
        <div class="pnl-row pl-4">
          <span class="text-gray-600 text-sm">Business</span>
          <span class="text-gray-600 text-sm">(${formatCurrency(totalProfessional)})</span>
        </div>

        <div class="pnl-row pnl-total">
          <span class="${netPL >= 0 ? 'pnl-positive' : 'pnl-negative'}">Net Profit / Loss</span>
          <span class="${netPL >= 0 ? 'pnl-positive' : 'pnl-negative'}">${netPL >= 0 ? '' : '('}${formatCurrency(Math.abs(netPL))}${netPL >= 0 ? '' : ')'}</span>
        </div>
        <div class="pnl-row">
          <span class="text-gray-500 text-sm">Tax Deductible Expenses</span>
          <span class="text-sm font-medium text-indigo-600">${formatCurrency(taxDeductible)}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="section-title">Revenue vs Expenses</span></div>
      <div class="card-body">
        <canvas id="chart-pnl" height="230"></canvas>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><span class="section-title">Quick Summary</span></div>
    <div class="card-body">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div class="p-4 bg-green-50 rounded-xl">
          <div class="text-2xl font-bold text-green-700">${formatCurrency(totalRevenue)}</div>
          <div class="text-sm text-green-600 mt-1">Total Income</div>
        </div>
        <div class="p-4 bg-red-50 rounded-xl">
          <div class="text-2xl font-bold text-red-700">${formatCurrency(totalExpenses)}</div>
          <div class="text-sm text-red-600 mt-1">Total Spent</div>
        </div>
        <div class="p-4 ${netPL >= 0 ? 'bg-indigo-50' : 'bg-orange-50'} rounded-xl">
          <div class="text-2xl font-bold ${netPL >= 0 ? 'text-indigo-700' : 'text-orange-700'}">${formatCurrency(Math.abs(netPL))}</div>
          <div class="text-sm ${netPL >= 0 ? 'text-indigo-600' : 'text-orange-600'} mt-1">${netPL >= 0 ? 'Net Profit' : 'Net Loss'}</div>
        </div>
      </div>
    </div>
  </div>`;
}

function initPnLChart() {
  const c = document.getElementById('chart-pnl');
  if (!c) return;
  const rev = DB.get('revenue').reduce((s,r) => s + Number(r.amount), 0);
  const pe = DB.get('personal_expenses').reduce((s,e) => s + Number(e.amount), 0);
  const be = DB.get('professional_expenses').reduce((s,e) => s + Number(e.amount), 0);
  chartInstances.pnl = new Chart(c, {
    type: 'bar',
    data: {
      labels: ['Revenue', 'Personal Exp', 'Business Exp'],
      datasets: [{
        data: [rev, pe, be],
        backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)'],
        borderRadius: 8, borderSkipped: false
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => '₹' + (v/1000).toFixed(0) + 'k' } },
        x: { grid: { display: false } }
      }
    }
  });
}

// ============================================================
// VIEW: CLIENT BOOKINGS
// ============================================================
function renderClientBookings() {
  const bookings = DB.get('client_bookings');
  const upcoming = bookings.filter(b => b.date >= today()).sort((a,b) => a.date.localeCompare(b.date));
  const past = bookings.filter(b => b.date < today()).sort((a,b) => b.date.localeCompare(a.date));

  return `
  <div class="grid grid-cols-3 gap-4 mb-5">
    ${statCard('Upcoming', upcoming.length, 'bg-indigo-50', '#4f46e5', svgCalendar(), 'bookings')}
    ${statCard('Confirmed', bookings.filter(b=>b.status==='confirmed').length, 'bg-green-50', '#059669', svgCheck(), 'sessions')}
    ${statCard('Completed', bookings.filter(b=>b.status==='completed').length, 'bg-purple-50', '#7c3aed', svgTask(), 'total')}
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div class="card">
      <div class="card-header">
        <span class="section-title">Upcoming Bookings</span>
        <button class="btn btn-primary btn-sm" onclick="App.openModal('booking')">+ New Booking</button>
      </div>
      <div class="card-body p-0">
      ${upcoming.length === 0 ? '<div class="empty-state">No upcoming bookings.<br><small>Share your booking link with clients.</small></div>' :
        upcoming.map(b => bookingCard(b)).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="section-title">Past Bookings</span>
      </div>
      <div class="card-body p-0">
      ${past.length === 0 ? '<div class="empty-state">No past bookings yet.</div>' :
        past.map(b => bookingCard(b)).join('')}
      </div>
    </div>
  </div>`;
}

function bookingCard(b) {
  return `<div class="flex gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
    <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm flex-shrink-0">${escape(b.clientName[0])}</div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <div class="font-semibold text-sm text-gray-800 truncate">${escape(b.clientName)}</div>
        <span class="badge badge-${b.status} flex-shrink-0">${b.status}</span>
      </div>
      <div class="text-xs text-gray-500 mt-0.5">${escape(b.service)}</div>
      <div class="text-xs text-gray-400 mt-0.5">📅 ${formatDate(b.date)} · ${b.startTime}${b.endTime ? ' – '+b.endTime : ''}</div>
      ${b.email ? `<div class="text-xs text-gray-400">✉ ${escape(b.email)}</div>` : ''}
      ${b.notes ? `<div class="text-xs text-indigo-500 mt-0.5 italic">${escape(b.notes)}</div>` : ''}
    </div>
    <div class="flex gap-1 items-start">
      ${b.status === 'pending' ? `<button class="btn-icon" title="Confirm" onclick="App.updateBookingStatus('${b.id}','confirmed')">
        <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      </button>` : ''}
      <button class="btn-icon" onclick="App.deleteItem('client_bookings','${b.id}','client-bookings')">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  </div>`;
}

// ============================================================
// MODALS
// ============================================================
const MODALS = {
  task: (data = {}) => `
    <div class="p-6 modal-in">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-gray-800">${data.id ? 'Edit Task' : 'Add Task'}</h2>
        <button class="btn-icon" onclick="App.closeModal()"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <form onsubmit="App.saveTask(event, '${data.id || ''}')">
        <div class="form-group">
          <label class="form-label">Title *</label>
          <input class="form-input" name="title" required value="${escape(data.title || '')}" placeholder="Task title...">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Type</label>
            <select class="form-select" name="type">
              <option value="personal" ${data.type==='personal'?'selected':''}>Personal</option>
              <option value="professional" ${data.type==='professional'?'selected':''}>Professional</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select class="form-select" name="priority">
              <option value="low" ${data.priority==='low'?'selected':''}>Low</option>
              <option value="medium" ${data.priority==='medium'||!data.priority?'selected':''}>Medium</option>
              <option value="high" ${data.priority==='high'?'selected':''}>High</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-select" name="status">
              <option value="todo" ${data.status==='todo'||!data.status?'selected':''}>To Do</option>
              <option value="in-progress" ${data.status==='in-progress'?'selected':''}>In Progress</option>
              <option value="done" ${data.status==='done'?'selected':''}>Done</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <input class="form-input" name="category" value="${escape(data.category || '')}" placeholder="e.g. Finance, Health">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input class="form-input" type="date" name="dueDate" value="${data.dueDate || today()}">
          </div>
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <input class="form-input" type="time" name="startTime" value="${data.startTime || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">End Time</label>
            <input class="form-input" type="time" name="endTime" value="${data.endTime || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" name="description" placeholder="Details...">${escape(data.description || '')}</textarea>
        </div>
        <div class="flex gap-3 justify-end mt-2">
          ${data.id ? `<button type="button" class="btn btn-danger" onclick="App.deleteTask('${data.id}')">Delete</button>` : ''}
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${data.id ? 'Save Changes' : 'Add Task'}</button>
        </div>
      </form>
    </div>`,

  'personal-expense': (data = {}) => expenseModal('personal', data),
  'professional-expense': (data = {}) => expenseModal('professional', data),

  revenue: (data = {}) => `
    <div class="p-6 modal-in">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-gray-800">Add Revenue</h2>
        <button class="btn-icon" onclick="App.closeModal()"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <form onsubmit="App.saveRevenue(event)">
        <div class="form-group">
          <label class="form-label">Source / Description *</label>
          <input class="form-input" name="source" required placeholder="e.g. Client A – Project Payment">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Amount (₹) *</label>
            <input class="form-input" type="number" name="amount" required min="0" step="0.01" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" name="category">
              ${['Freelance','Retainer','Consulting','Salary','Investment','Digital Products','Rental','Bonus','Other'].map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Date</label>
            <input class="form-input" type="date" name="date" value="${today()}">
          </div>
          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <select class="form-select" name="paymentMethod">
              ${['Bank Transfer','UPI','Cash','Cheque','PayPal','Stripe','Other'].map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <div class="form-check">
            <input type="checkbox" name="isRecurring" id="is-recurring" onchange="document.getElementById('freq-group').style.display=this.checked?'block':'none'">
            <label for="is-recurring" class="form-label" style="margin:0;cursor:pointer">Recurring income</label>
          </div>
        </div>
        <div id="freq-group" style="display:none" class="form-group">
          <label class="form-label">Frequency</label>
          <select class="form-select" name="frequency">
            <option>weekly</option><option selected>monthly</option><option>quarterly</option><option>annually</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="form-textarea" name="notes" placeholder="Any additional notes..."></textarea>
        </div>
        <div class="flex gap-3 justify-end mt-2">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Revenue</button>
        </div>
      </form>
    </div>`,

  booking: () => `
    <div class="p-6 modal-in">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-bold text-gray-800">New Client Booking</h2>
          <p class="text-xs text-gray-500 mt-0.5">Fill in client details to block your calendar</p>
        </div>
        <button class="btn-icon" onclick="App.closeModal()"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <form onsubmit="App.saveBooking(event)">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Client Name *</label>
            <input class="form-input" name="clientName" required placeholder="Full name">
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input class="form-input" type="email" name="email" required placeholder="client@example.com">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-input" name="phone" placeholder="10-digit number">
          </div>
          <div class="form-group">
            <label class="form-label">Service / Purpose *</label>
            <input class="form-input" name="service" required placeholder="e.g. Strategy Consultation">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Date *</label>
            <input class="form-input" type="date" name="date" required value="${today()}">
          </div>
          <div class="form-group">
            <label class="form-label">Start Time *</label>
            <input class="form-input" type="time" name="startTime" required value="10:00">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">End Time</label>
          <input class="form-input" type="time" name="endTime" value="11:00">
        </div>
        <div class="form-group">
          <label class="form-label">Notes / Agenda</label>
          <textarea class="form-textarea" name="notes" placeholder="What will you discuss? Any prep needed?"></textarea>
        </div>
        <div class="flex gap-3 justify-end mt-2">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Book Session</button>
        </div>
      </form>
    </div>`,

  quickadd: () => `
    <div class="p-6 modal-in">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-gray-800">Quick Add</h2>
        <button class="btn-icon" onclick="App.closeModal()"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${[['task','📋 Task','Add a personal or professional task'],
           ['booking','👥 Client Booking','Block calendar for a client'],
           ['personal-expense','💳 Personal Expense','Log a personal spend'],
           ['professional-expense','💼 Business Expense','Log a business expense'],
           ['revenue','💰 Revenue','Record income received']]
          .map(([type, label, desc]) => `
          <button class="text-left p-4 border-2 border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all" onclick="App.openModal('${type}')">
            <div class="text-base mb-1">${label}</div>
            <div class="text-xs text-gray-500">${desc}</div>
          </button>`).join('')}
      </div>
    </div>`
};

function expenseModal(type, data = {}) {
  return `
    <div class="p-6 modal-in">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-gray-800">Add ${type === 'personal' ? 'Personal' : 'Business'} Expense</h2>
        <button class="btn-icon" onclick="App.closeModal()"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <form onsubmit="App.saveExpense(event, '${type}')">
        <div class="form-group">
          <label class="form-label">Description *</label>
          <input class="form-input" name="description" required placeholder="What did you spend on?">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Amount (₹) *</label>
            <input class="form-input" type="number" name="amount" required min="0" step="0.01" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" name="category">
              ${(type === 'personal'
                ? ['Food','Transport','Utilities','Health','Entertainment','Shopping','Education','Housing','Other']
                : ['Software','Office','Marketing','Business Meals','Travel','Equipment','Professional Dev','Subscriptions','Other']
              ).map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Date</label>
            <input class="form-input" type="date" name="date" value="${today()}">
          </div>
          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <select class="form-select" name="paymentMethod">
              ${['UPI','Credit Card','Debit Card','Cash','Bank Transfer','Net Banking','Other'].map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        ${type === 'professional' ? `
        <div class="form-group">
          <div class="form-check">
            <input type="checkbox" name="taxDeductible" id="tax-ded" checked>
            <label for="tax-ded" class="form-label" style="margin:0;cursor:pointer">Tax deductible</label>
          </div>
        </div>` : ''}
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="form-textarea" name="notes" placeholder="Any details..."></textarea>
        </div>
        <div class="flex gap-3 justify-end mt-2">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Expense</button>
        </div>
      </form>
    </div>`;
}

// ============================================================
// APP ACTIONS
// ============================================================
const App = {
  openModal(type, data = {}) {
    const overlay = document.getElementById('modal-overlay');
    const box = document.getElementById('modal-box');
    const fn = MODALS[type];
    if (!fn) return;
    box.innerHTML = fn(data);
    overlay.classList.remove('hidden');
  },
  closeModal(event) {
    if (event && event.target !== document.getElementById('modal-overlay')) return;
    document.getElementById('modal-overlay').classList.add('hidden');
  },
  openQuickAdd() { this.openModal('quickadd'); },
  addTaskForDate(dateStr) {
    this.openModal('task', { dueDate: dateStr });
  },

  saveTask(e, existingId) {
    e.preventDefault();
    const form = e.target;
    const tasks = DB.get('tasks');
    const taskData = {
      id: existingId || uid(),
      title: form.title.value.trim(),
      type: form.type.value,
      priority: form.priority.value,
      status: form.status.value,
      category: form.category.value.trim(),
      dueDate: form.dueDate.value,
      startTime: form.startTime.value,
      endTime: form.endTime.value,
      description: form.description.value.trim()
    };
    if (existingId) {
      const idx = tasks.findIndex(t => t.id === existingId);
      if (idx !== -1) tasks[idx] = taskData;
    } else {
      tasks.push(taskData);
    }
    DB.set('tasks', tasks);
    document.getElementById('modal-overlay').classList.add('hidden');
    navigate(currentView);
  },

  editTask(id) {
    const tasks = DB.get('tasks');
    const task = tasks.find(t => t.id === id);
    if (task) this.openModal('task', task);
  },

  deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    DB.set('tasks', DB.get('tasks').filter(t => t.id !== id));
    document.getElementById('modal-overlay').classList.add('hidden');
    navigate(currentView);
  },

  saveExpense(e, type) {
    e.preventDefault();
    const form = e.target;
    const key = type === 'personal' ? 'personal_expenses' : 'professional_expenses';
    const items = DB.get(key);
    items.push({
      id: uid(),
      description: form.description.value.trim(),
      amount: parseFloat(form.amount.value),
      category: form.category.value,
      date: form.date.value,
      paymentMethod: form.paymentMethod.value,
      taxDeductible: type === 'professional' ? form.taxDeductible?.checked || false : undefined,
      notes: form.notes.value.trim()
    });
    DB.set(key, items);
    document.getElementById('modal-overlay').classList.add('hidden');
    navigate(currentView);
  },

  saveRevenue(e) {
    e.preventDefault();
    const form = e.target;
    const items = DB.get('revenue');
    items.push({
      id: uid(),
      source: form.source.value.trim(),
      amount: parseFloat(form.amount.value),
      category: form.category.value,
      date: form.date.value,
      paymentMethod: form.paymentMethod.value,
      isRecurring: form.isRecurring.checked,
      frequency: form.isRecurring.checked ? form.frequency.value : '',
      notes: form.notes.value.trim()
    });
    DB.set('revenue', items);
    document.getElementById('modal-overlay').classList.add('hidden');
    navigate('revenue');
  },

  saveBooking(e) {
    e.preventDefault();
    const form = e.target;
    const bookings = DB.get('client_bookings');
    bookings.push({
      id: uid(),
      clientName: form.clientName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      service: form.service.value.trim(),
      date: form.date.value,
      startTime: form.startTime.value,
      endTime: form.endTime.value,
      status: 'pending',
      notes: form.notes.value.trim()
    });
    DB.set('client_bookings', bookings);
    document.getElementById('modal-overlay').classList.add('hidden');
    navigate('client-bookings');
  },

  updateBookingStatus(id, status) {
    const bookings = DB.get('client_bookings');
    const b = bookings.find(b => b.id === id);
    if (b) b.status = status;
    DB.set('client_bookings', bookings);
    navigate('client-bookings');
  },

  deleteItem(key, id, view) {
    if (!confirm('Delete this item?')) return;
    DB.set(key, DB.get(key).filter(i => i.id !== id));
    navigate(view);
  },

  setTaskFilter(f) {
    taskFilter = f;
    navigate('tasks');
  }
};

// ============================================================
// SVG HELPERS
// ============================================================
const svgTask = () => `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`;
const svgCalendar = () => `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
const svgMoney = () => `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
const svgChart = () => `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`;
const svgTag = () => `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>`;
const svgCheck = () => `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
const svgRepeat = () => `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`;
const svgPercent = () => `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initSampleData();

  const userName = localStorage.getItem('ph_user') || 'Srinivasan';
  document.getElementById('user-name-display').textContent = userName;
  document.getElementById('user-avatar').textContent = userName[0].toUpperCase();

  const now = new Date();
  document.getElementById('current-date').textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.view));
  });

  navigate('dashboard');
});
