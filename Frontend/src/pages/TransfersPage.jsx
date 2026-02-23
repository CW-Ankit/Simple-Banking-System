import { useState } from 'react';

function createIdempotencyKey(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export default function TransfersPage({ accounts, createTransfer, createInitialFunds, onSuccess }) {
  const [transferForm, setTransferForm] = useState({
    fromAccount: accounts[0]?._id || '',
    toAccount: accounts[1]?._id || accounts[0]?._id || '',
    amount: '',
  });

  const [fundForm, setFundForm] = useState({
    toAccount: accounts[0]?._id || '',
    amount: '',
  });

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
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account._id}
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
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account._id}
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
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account._id}
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
