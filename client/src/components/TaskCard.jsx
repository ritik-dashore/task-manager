import { CalendarDays, Check, Circle, Clock3, Pencil, Play, RotateCcw, Trash2 } from 'lucide-react';
import { formatDate, isOverdue } from '../utils/date.js';

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const overdue = task.status !== 'Completed' && isOverdue(task.dueDate);
  const isPending = task.status === 'Pending';
  const isInProgress = task.status === 'In Progress';
  const statusIcon = isPending ? <Circle size={20} strokeWidth={1.6} /> :
    isInProgress ? <Clock3 size={19} strokeWidth={1.8} /> : <Check size={15} strokeWidth={2.5} />;
  const nextStatus = isPending ? 'In Progress' : isInProgress ? 'Completed' : 'Pending';
  const actionLabel = isPending ? 'Start' : isInProgress ? 'Complete' : 'Reopen';
  return (
    <article className={`task-card ${task.status === 'Completed' ? 'is-complete' : ''}`}>
      <span className={`task-status-icon ${task.status === 'Completed' ? 'checked' : ''}`} aria-hidden="true">{statusIcon}</span>
      <div className="task-content">
        <div className="task-title-row"><h3>{task.title}</h3><span className={`status-badge ${isPending ? 'pending' : isInProgress ? 'in-progress' : 'completed'}`}>{task.status}</span><span className={`priority-badge ${task.priority.toLowerCase()}`}><i />{task.priority}</span></div>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          {task.dueDate && <span className={`due-date ${overdue ? 'overdue' : ''}`}><CalendarDays size={14} />{overdue ? 'Overdue · ' : 'Due '}{formatDate(task.dueDate)}</span>}
          <span className="created-date">Added {formatDate(task.createdAt)}</span>
        </div>
      </div>
      <div className="task-actions">
        {isInProgress && <button type="button" className="icon-button status-back-button" aria-label={`Move "${task.title}" to To do`} title="Move to To do" onClick={() => onStatusChange(task, 'Pending')}><RotateCcw size={15} /></button>}
        <button type="button" className="status-action" onClick={() => onStatusChange(task, nextStatus)}>{isPending ? <Play size={13} fill="currentColor" /> : isInProgress ? <Check size={14} /> : <RotateCcw size={14} />}{actionLabel}</button>
        <button type="button" className="icon-button" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}><Pencil size={16} /></button>
        <button type="button" className="icon-button danger-hover" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}><Trash2 size={16} /></button>
      </div>
    </article>
  );
}
