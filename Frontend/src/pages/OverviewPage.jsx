import { useMemo } from 'react';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

export default function OverviewPage({ accounts, balances, transactions, isRefreshing, refresh }) {
  const totals = useMemo(() => {
    const knownBalances = Object.values(balances).filter((value) => typeof value === 'number');
    const totalBalance = knownBalances.reduce((sum, value) => sum + value, 0);

<<<<<<< HEAD
    const completed = transactions.filter((item) => item.status === 'completed').length;
    const pending = transactions.filter((item) => item.status === 'pending').length;
=======
    const completed = transactions.filter((item) => (item.status || '').toLowerCase() === 'complete').length;
    const pending = transactions.filter((item) => (item.status || '').toLowerCase() === 'pending').length;
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc

    return { totalBalance, completed, pending };
  }, [balances, transactions]);

  return (
    <div className="stack-lg">
      <div className="section-header">
        <div>
          <h2>Account health</h2>
          <p>Quick pulse of current banking activity.</p>
        </div>
        <button className="ghost-button" onClick={refresh} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="stats-grid">
        <StatCard label="Total accounts" value={accounts.length} />
        <StatCard label="Combined balance" value={`$${totals.totalBalance.toFixed(2)}`} tone="success" />
        <StatCard label="Completed transactions" value={totals.completed} />
        <StatCard label="Pending transactions" value={totals.pending} tone="warning" />
      </div>

      <div>
        <h3>Recent transactions</h3>
        {transactions.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Once transfers start happening, the latest transactions will appear here."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 6).map((item) => (
                  <tr key={item._id}>
                    <td>{item._id}</td>
                    <td>
<<<<<<< HEAD
                      <span className={`badge badge--${item.status || 'pending'}`}>{item.status || 'unknown'}</span>
=======
                      {(() => { const status = (item.status || 'pending').toLowerCase(); return <span className={`badge badge--${status}`}>{status}</span>; })()}
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
                    </td>
                    <td>${Number(item.amount || 0).toFixed(2)}</td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
