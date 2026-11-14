import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toDateInput } from '../utils/date.js';

const blankTask = { title: '', description: '', priority: 'Medium', dueDate: '' };

export default function TaskForm({ task, onSubmit, onClose, saving }) {
  const [form, setForm] = useState(blankTask);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(task ? {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: toDateInput(task.dueDate),
    } : blankTask);
    setError('');
  }, [task]);

  function update(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError('A task title is required.');
      return;
    }
    if (title.length > 120) {
      setError('Keep the title under 120 characters.');
      return;
    }
    if (form.description.length > 2000) {
      setError('Keep the description under 2,000 characters.');
      return;
    }
    const result = await onSubmit({
      ...form,
      title,
      description: form.description.trim(),
      dueDate: form.dueDate || null,
    });
    if (result?.error) setError(result.error);
  }

  return (
    <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && !saving && onClose()}>
      <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-heading">
          <div><span className="eyebrow">{task ? 'MAKE AN UPDATE' : 'A FRESH START'}</span>
            <h2 id="form-title">{task ? 'Edit task' : 'Create a task'}</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close form" disabled={saving}><X size={19} /></button>
        </div>
        <form onSubmit={submit} className="task-form">
          <label htmlFor="task-title">Task title <span className="required">*</span></label>
          <input id="task-title" name="title" value={form.title} onChange={update} maxLength={120} autoFocus placeholder="What needs to get done?" required />

          <label htmlFor="task-description">Description <span className="optional">Optional</span></label>
          <textarea id="task-description" name="description" value={form.description} onChange={update} maxLength={2000} rows={4} placeholder="Add a few details to stay on track..." />

          <div className="form-row">
            <div><label htmlFor="task-priority">Priority</label>
              <select id="task-priority" name="priority" value={form.priority} onChange={update}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select></div>
            <div><label htmlFor="task-due-date">Due date <span className="optional">Optional</span></label>
              <input id="task-due-date" name="dueDate" type="date" value={form.dueDate} onChange={update} /></div>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions">
            <button className="button button-quiet" type="button" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
