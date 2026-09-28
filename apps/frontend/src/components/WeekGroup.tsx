import type { WeekGroup as WeekGroupType } from '../types';
import ClassItem from './ClassItem';

export default function WeekGroup({ group }: { group: WeekGroupType }) {
  return (
    <div className="week-group">
      <h3 className="week-group-title">Semana {group.week}</h3>
      <div className="week-group-items">
        {group.classes.map((cls, i) => (
          <ClassItem key={cls.id} item={cls} index={i} />
        ))}
      </div>
    </div>
  );
}
