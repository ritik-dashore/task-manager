import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ClipboardList, Plus, Sparkles } from 'lucide-react';
import api, { getApiError } from './services/api.js';
import Stats from './components/Stats.jsx';
import TaskCard from './components/TaskCard.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskToolbar from './components/TaskToolbar.jsx';

const PAGE_SIZE = 50;

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formTask, setFormTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyTask, setBusyTask] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const loadTasks = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: 1, limit: PAGE_SIZE, sort };
      if (status !== 'All') params.status = status;
      if (priority) params.priority = priority;
      if (search) params.search = search;
      const response = await api.get('/tasks', { params, signal });
      setTasks(response.data.data.tasks);
      setStats(response.data.data.stats);
    } catch (requestError) {
      if (requestError.code !== 'ERR_CANCELED') {
        setTasks([]);
        setError(getApiError(requestError));
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [status, priority, sort, search]);

  useEffect(() => {
    const controller = new AbortController();
    loadTasks(controller.signal);
    return () => controller.abort();
  }, [loadTasks]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(''), 3200);
    return () => clearTimeout(timeout);
  }, [notice]);

  const visibleCountLabel = useMemo(() => {
    if (loading) return 'Loading your tasks';
    const count = tasks.length;
    return `${count} ${count === 1 ? 'task' : 'tasks'}${search || priority ? ' found' : ''}`;
  }, [loading, tasks.length, search, priority]);

  async function saveTask(values) {
    setSaving(true);
    try {
      if (formTask) await api.patch(`/tasks/${formTask._id}`, values);
      else await api.post('/tasks', values);
      setShowForm(false);
      setFormTask(null);
      setNotice(formTask ? 'Your task has been updated.' : 'Your task has been created.');
      await loadTasks();
      return {};
    } catch (requestError) {
      return { error: getApiError(requestError) };
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setBusyTask(task._id);
    try {
      await api.patch(`/tasks/${task._id}`, { status: task.status === 'Completed' ? 'Pending' : 'Completed' });
      setNotice(task.status === 'Completed' ? 'Task moved back to to do.' : 'Nice work — task completed.');
      await loadTasks();
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setBusyTask('');
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"? This action cannot be undone.`)) return;
    setBusyTask(task._id);
    try {
      await api.delete(`/tasks/${task._id}`);
      setNotice('Task deleted.');
      await loadTasks();
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setBusyTask('');
    }
  }

  function editTask(task) {
    setFormTask(task);
    setShowForm(true);
  }

  function openCreate() {
    setFormTask(null);
    setShowForm(true);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Daymark home"><span className="brand-mark"><Check size={17} strokeWidth={2.8} /></span><span>daymark</span></a>
        <div className="topbar-right"><span className="workspace-label"><span className="online-dot" />Personal workspace</span><span className="avatar" aria-label="Personal workspace">D</span></div>
      </header>
      <main className="main-content">
        <section className="welcome-row">
          <div><div className="eyebrow welcome-eyebrow"><Sparkles size={14} /> YOUR SPACE TO GET THINGS DONE</div><h1>Make today <span>count.</span></h1><p className="page-subtitle">A little progress adds up. What will you work on?</p></div>
          <button className="button button-primary create-button" onClick={openCreate}><Plus size={18} />New task</button>
        </section>

        <Stats stats={stats} />

        <section className="tasks-section" aria-labelledby="tasks-heading">
          <div className="section-heading"><div><div className="heading-title"><h2 id="tasks-heading">Your tasks</h2><span className="task-count">{stats.total}</span></div><p>Keep your focus on what matters</p></div><span className="task-total-label"><ClipboardList size={15} />{visibleCountLabel}</span></div>
          <TaskToolbar status={status} setStatus={setStatus} search={searchInput} setSearch={setSearchInput} priority={priority} setPriority={setPriority} sort={sort} setSort={setSort} />
          {error && <div className="alert-error" role="alert"><span>{error}</span><button type="button" onClick={() => loadTasks()} className="retry-button">Try again</button></div>}
          <div className="task-list" aria-live="polite">
            {loading ? <div className="loading-state"><span className="spinner" />Gathering your tasks…</div> :
              tasks.length ? tasks.map(task => <div key={task._id} className={busyTask === task._id ? 'task-busy' : ''}><TaskCard task={task} onToggle={toggleTask} onEdit={editTask} onDelete={deleteTask} /></div>) :
                <div className="empty-state"><span className="empty-icon"><ClipboardList size={25} /></span><h3>{error ? 'We couldn’t load your tasks' : search || priority ? 'No tasks match those filters' : status === 'Completed' ? 'Nothing completed just yet' : status === 'Pending' ? 'You’re all caught up' : 'A clear desk starts here'}</h3><p>{error ? 'Check the API connection and try again.' : search || priority ? 'Try changing your search or filters.' : status === 'Completed' ? 'Completed tasks will find a home here.' : status === 'Pending' ? 'Enjoy the breathing room, or add something new.' : 'Add your first task and turn a plan into progress.'}</p>{!error && status === 'All' && !search && <button className="button button-primary" onClick={openCreate}><Plus size={17} />Create your first task</button>}</div>}
          </div>
        </section>
        <footer className="footer-note">Small steps, meaningful progress. <span>✦</span></footer>
      </main>
      {notice && <div className="toast" role="status"><span><Check size={15} /></span>{notice}</div>}
      {showForm && <TaskForm task={formTask} onSubmit={saveTask} saving={saving} onClose={() => { if (!saving) setShowForm(false); }} />}
    </div>
  );
}
