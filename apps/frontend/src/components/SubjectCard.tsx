import { Link } from 'react-router-dom';
import type { Subject } from '../types';

export default function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <Link to={`/subject/${subject.id}`} className="subject-card">
      <div className="subject-card-img">
        {subject.img ? (
          <img src={subject.img} alt={subject.name} loading="lazy" />
        ) : (
          <div className="subject-card-placeholder">📖</div>
        )}
      </div>
      <h3 className="subject-card-name">{subject.name}</h3>
    </Link>
  );
}
