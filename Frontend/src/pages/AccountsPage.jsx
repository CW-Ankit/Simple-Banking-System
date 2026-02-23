import { useState } from 'react';
import EmptyState from '../components/EmptyState';

export default function AccountsPage({ accounts, balances, onCreateAccount, onRenameAccount, onDeleteAccount, isSystemUser, users }) {
  const [name, setName] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [busyId, setBusyId] = useState('');

  const submitCreate = async (event) => {
    event.preventDefault();
    await onCreateAccount({ name, userId: selectedUser || undefined });
    setName('');
  };

  const handleRename = async (account) => {
    const newName = window.prompt('Enter a new account name', account.name || '');
    if (!newName) return;
    setBusyId(account._id);
    try {
      await onRenameAccount(account._id, newName);
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async (account) => {
    const ok = window.confirm(`Delete account ${account.name || account._id}?`);
    if (!ok) return;
    setBusyId(account._id);
    try {
      await onDeleteAccount(account._id);
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="stack-md">
      <h2>{isSystemUser ? 'Accounts Administration' : 'Accounts'}</h2>

      <form className="form-card" onSubmit={submitCreate}>
        <h3>Create account</h3>
        <label>
          Custom account name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Savings / Payroll / Expenses" />
        </label>
        {isSystemUser ? (
          <label>
            Owner user
            <select value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)}>
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </label>
        ) : null}
        <button type="submit">Create account</button>
      </form>

      {!accounts.length ? (
        <EmptyState
          title="No accounts found"
          description="Accounts returned by the backend will be listed here."
        />
      ) : (
        <div className="accounts-grid">
          {accounts.map((account) => (
            <article key={account._id} className="account-card">
              <p className="account-card__id">{account._id}</p>
              <p className="account-card__owner">{account.name || 'Primary account'}</p>
              <p className="sidebar__subtext">{account.userName || account.ownerName || account.userEmail}</p>
              <p className="account-card__balance">
                {typeof balances[account._id] === 'number' ? `$${balances[account._id].toFixed(2)}` : 'Balance unavailable'}
              </p>
              <div className="row-actions">
                <button type="button" className="ghost-button" disabled={busyId === account._id} onClick={() => handleRename(account)}>
                  Rename
                </button>
                <button type="button" disabled={busyId === account._id} onClick={() => handleDelete(account)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
