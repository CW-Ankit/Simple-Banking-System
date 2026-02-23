<<<<<<< HEAD
import { useState } from 'react';
=======
import { useEffect, useMemo, useState } from 'react';
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc

function createIdempotencyKey(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

<<<<<<< HEAD
export default function TransfersPage({ accounts, createTransfer, createInitialFunds, onSuccess }) {
  const [transferForm, setTransferForm] = useState({
    fromAccount: accounts[0]?._id || '',
    toAccount: accounts[1]?._id || accounts[0]?._id || '',
=======
function accountOptionLabel(account) {
  return `${account.name || 'Account'} • ${account.userName || account.userEmail || account._id}`;
}

export default function TransfersPage({
  sourceAccounts,
  targetAccounts,
  createTransfer,
  createInitialFunds,
  onSuccess,
  isSystemUser,
  onSearchTargets,
}) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchTargets(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, onSearchTargets]);

  const recipientAccounts = useMemo(() => {
    if (isSystemUser) {
      return targetAccounts;
    }

    const myIds = new Set(sourceAccounts.map((account) => account._id));
    return targetAccounts.filter((account) => !myIds.has(account._id));
  }, [isSystemUser, sourceAccounts, targetAccounts]);


  const initialFundingAccounts = useMemo(() => {
    const merged = isSystemUser ? recipientAccounts : [...recipientAccounts, ...sourceAccounts];
    const map = new Map();
    merged.forEach((account) => map.set(account._id, account));
    return [...map.values()];
  }, [isSystemUser, recipientAccounts, sourceAccounts]);

  const [transferForm, setTransferForm] = useState({
    fromAccount: '',
    toAccount: '',
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
    amount: '',
  });

  const [fundForm, setFundForm] = useState({
<<<<<<< HEAD
    toAccount: accounts[0]?._id || '',
    amount: '',
  });

=======
    toAccount: '',
    amount: '',
  });

  useEffect(() => {
    setTransferForm((prev) => ({
      ...prev,
      fromAccount: prev.fromAccount || sourceAccounts[0]?._id || '',
      toAccount: prev.toAccount || recipientAccounts[0]?._id || '',
    }));

    setFundForm((prev) => ({
      ...prev,
      toAccount: prev.toAccount || recipientAccounts[0]?._id || sourceAccounts[0]?._id || '',
    }));
  }, [sourceAccounts, recipientAccounts]);

>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const submitTransfer = async (event) => {
    event.preventDefault();
    setBusy('transfer');
    setMessage('');

    try {
      await createTransfer({
        ...transferForm,
        amount: Number(transferForm.amount),
        idempotencyKey: createIdempotencyKey('transfer'),
      });
      setTransferForm((prev) => ({ ...prev, amount: '' }));
      setMessage('Transfer submitted successfully.');
      onSuccess();
    } finally {
      setBusy('');
    }
  };

  const submitInitialFunds = async (event) => {
    event.preventDefault();
    setBusy('funds');
    setMessage('');

    try {
      await createInitialFunds({
        ...fundForm,
        amount: Number(fundForm.amount),
        idempotencyKey: createIdempotencyKey('initial'),
      });
      setFundForm((prev) => ({ ...prev, amount: '' }));
      setMessage('Initial funds request submitted.');
      onSuccess();
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="stack-lg">
      <div className="section-header">
        <div>
          <h2>Transfer center</h2>
          <p>Initiate money movement with idempotent requests.</p>
        </div>
      </div>

<<<<<<< HEAD
=======
      <div className="form-card">
        <h3>{isSystemUser ? 'Search all accounts' : 'Search recipients'}</h3>
        <input
          placeholder="Search by account name, user name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <p className="sidebar__subtext">{recipientAccounts.length} matching recipient account(s)</p>
      </div>

>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
      {message ? <div className="alert alert--success">{message}</div> : null}

      <div className="two-col-grid">
        <form className="form-card" onSubmit={submitTransfer}>
          <h3>Create transfer</h3>

          <label>
            From account
            <select
              required
              value={transferForm.fromAccount}
              onChange={(event) =>
                setTransferForm((prev) => ({ ...prev, fromAccount: event.target.value }))
              }
            >
<<<<<<< HEAD
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account._id}
=======
              {sourceAccounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {accountOptionLabel(account)}
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
                </option>
              ))}
            </select>
          </label>

          <label>
            To account
            <select
              required
              value={transferForm.toAccount}
              onChange={(event) => setTransferForm((prev) => ({ ...prev, toAccount: event.target.value }))}
            >
<<<<<<< HEAD
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account._id}
=======
              {recipientAccounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {accountOptionLabel(account)}
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
                </option>
              ))}
            </select>
          </label>

          <label>
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={transferForm.amount}
              onChange={(event) => setTransferForm((prev) => ({ ...prev, amount: event.target.value }))}
            />
          </label>

          <button type="submit" disabled={busy === 'transfer'}>
            {busy === 'transfer' ? 'Submitting...' : 'Submit transfer'}
          </button>
        </form>

        <form className="form-card" onSubmit={submitInitialFunds}>
          <h3>Add initial funds</h3>

          <label>
            To account
            <select
              required
              value={fundForm.toAccount}
              onChange={(event) => setFundForm((prev) => ({ ...prev, toAccount: event.target.value }))}
            >
<<<<<<< HEAD
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account._id}
=======
              {initialFundingAccounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {accountOptionLabel(account)}
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
                </option>
              ))}
            </select>
          </label>

          <label>
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={fundForm.amount}
              onChange={(event) => setFundForm((prev) => ({ ...prev, amount: event.target.value }))}
            />
          </label>

          <button type="submit" disabled={busy === 'funds'}>
            {busy === 'funds' ? 'Submitting...' : 'Add funds'}
          </button>
        </form>
      </div>
    </div>
  );
}
