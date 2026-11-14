import { CalendarDays, Check, Circle, Pencil, Trash2 } from 'lucide-react';
import { formatDate, isOverdue } from '../utils/date.js';

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const overdue = task.status === 'Pending' && isOverdue(task.dueDate);
  return (
    <article className={`task-card ${task.status === 'Completed' ? 'is-complete' : ''}`}>
      <button className={`check-button ${task.status === 'Completed' ? 'checked' : ''}`} onClick={() => onToggle(task)} aria-label={`Mark "${task.title}" ${task.status === 'Completed' ? 'pending' : 'completed'}`}>
        {task.status === 'Completed' ? <Check size={15} strokeWidth={2.5} /> : <Circle size={20} strokeWidth={1.6} />}
      </button>
      <div className="task-content">
        <div className="task-title-row"><h3>{task.title}</h3><span className={`priority-badge ${task.priority.toLowerCase()}`}><i />{task.priority}</span></div>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          {task.dueDate && <span className={`due-date ${overdue ? 'overdue' : ''}`}><CalendarDays size={14} />{overdue ? 'Overdue · ' : 'Due '}{formatDate(task.dueDate)}</span>}
          <span className="created-date">Added {formatDate(task.createdAt)}</span>
        </div>
      </div>
      <div className="task-actions">
        <button type="button" className="icon-button" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}><Pencil size={16} /></button>
        <button type="button" className="icon-button danger-hover" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}><Trash2 size={16} /></button>
      </div>
    </article>
  );
}
