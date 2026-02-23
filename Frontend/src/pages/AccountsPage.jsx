import EmptyState from '../components/EmptyState';

export default function AccountsPage({ accounts, balances }) {
  if (!accounts.length) {
    return (
      <EmptyState
        title="No accounts found"
        description="Accounts returned by the backend will be listed here."
      />
    );
  }

  return (
    <div className="stack-md">
      <h2>Accounts</h2>
      <div className="accounts-grid">
        {accounts.map((account) => (
          <article key={account._id} className="account-card">
            <p className="account-card__id">{account._id}</p>
            <p className="account-card__owner">{account.ownerName || account.name || 'Primary account'}</p>
            <p className="account-card__balance">
              {typeof balances[account._id] === 'number' ? `$${balances[account._id].toFixed(2)}` : 'Balance unavailable'}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
