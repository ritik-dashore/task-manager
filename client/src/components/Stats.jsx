import { CheckCheck, CircleDashed, Clock3, ListTodo } from 'lucide-react';

const cards = [
  { key: 'total', label: 'Total tasks', icon: ListTodo, tone: 'violet' },
  { key: 'pending', label: 'To do', icon: CircleDashed, tone: 'amber' },
  { key: 'inProgress', label: 'In progress', icon: Clock3, tone: 'blue' },
  { key: 'completed', label: 'Completed', icon: CheckCheck, tone: 'green' },
];

export default function Stats({ stats }) {
  return (
    <section className="stats-grid" aria-label="Task statistics">
      {cards.map(({ key, label, icon: Icon, tone }) => (
        <article className="stat-card" key={key}>
          <span className={`stat-icon ${tone}`}><Icon size={19} strokeWidth={1.8} /></span>
          <div><p>{label}</p><strong>{stats[key]}</strong></div>
        </article>
      ))}
    </section>
  );
}
