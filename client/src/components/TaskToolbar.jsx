import { Search, SlidersHorizontal } from 'lucide-react';

const tabs = [
  { value: 'All', label: 'All tasks' },
  { value: 'Pending', label: 'To do' },
  { value: 'In Progress', label: 'In progress' },
  { value: 'Completed', label: 'Completed' },
];

export default function TaskToolbar({ status, setStatus, search, setSearch, priority, setPriority, sort, setSort }) {
  return (
    <div className="task-toolbar">
      <div className="filter-tabs" role="group" aria-label="Filter by status">
        {tabs.map(tab => <button key={tab.value} type="button" aria-pressed={status === tab.value} className={status === tab.value ? 'active' : ''} onClick={() => setStatus(tab.value)}>{tab.label}</button>)}
      </div>
      <div className="toolbar-controls">
        <label className="search-box"><Search size={17} /><span className="sr-only">Search tasks</span><input type="search" placeholder="Search tasks..." value={search} onChange={event => setSearch(event.target.value)} /></label>
        <label className="select-control"><SlidersHorizontal size={15} /><span className="sr-only">Filter by priority</span>
          <select value={priority} onChange={event => setPriority(event.target.value)} aria-label="Filter by priority"><option value="">Any priority</option><option>High</option><option>Medium</option><option>Low</option></select></label>
        <label className="sort-control"><span>Sort:</span>
          <select value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort tasks"><option value="createdAt:desc">Newest first</option><option value="createdAt:asc">Oldest first</option><option value="dueDate:asc">Due date</option></select></label>
      </div>
    </div>
  );
}
