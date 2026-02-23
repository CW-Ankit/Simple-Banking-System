import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="empty-state">
      <h2>Page not found</h2>
      <p>The route you requested does not exist.</p>
      <Link className="inline-link" to="/dashboard">
        Go to dashboard
      </Link>
    </div>
  );
}
