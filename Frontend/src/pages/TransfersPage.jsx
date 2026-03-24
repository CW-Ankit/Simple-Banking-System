import { useEffect, useMemo, useState } from 'react';

function createIdempotencyKey(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function sourceLabel(account) {
  const accountNo = account.accountNumber || account._id;
  return `${account.name || 'Account'} (${accountNo})`;
}

function recipientLabel(account) {
  const accountNo = account.accountNumber || account._id;
  return `${account.userName || account.userEmail || 'User'} • ${account.name || 'Account'} • ${accountNo}`;
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
  const [toAccountInput, setToAccountInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchTargets(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, onSearchTargets]);

  const recipientAccounts = useMemo(() => targetAccounts, [targetAccounts]);

  const [transferForm, setTransferForm] = useState({
    fromAccount: '',
    amount: '',
  });

  const [fundForm, setFundForm] = useState({
    toAccount: '',
    amount: '',
  });

  const availableDestinationAccounts = useMemo(
    () => recipientAccounts.filter((account) => account._id !== transferForm.fromAccount),
    [recipientAccounts, transferForm.fromAccount],
  );

  useEffect(() => {
      setTransferForm((prev) => ({
        ...prev,
        fromAccount: prev.fromAccount || sourceAccounts[0]?._id || '',
      }));

      setFundForm((prev) => ({
        ...prev,
        toAccount: prev.toAccount || (recipientAccounts[0]?.accountNumber || recipientAccounts[0]?._id || ''),
      }));
  }, [sourceAccounts, recipientAccounts]);

  useEffect(() => {
    if (toAccountInput) return;
    setToAccountInput(availableDestinationAccounts[0]?.accountNumber || availableDestinationAccounts[0]?._id || '');
  }, [availableDestinationAccounts, toAccountInput]);

  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submitTransfer = async (event) => {
    event.preventDefault();
    setBusy('transfer');
    setMessage('');
    setError('');

    try {
      await createTransfer({
        fromAccount: transferForm.fromAccount,
        toAccount: toAccountInput.trim(),
        amount: Number(transferForm.amount),
        idempotencyKey: createIdempotencyKey('transfer'),
      });
      setTransferForm((prev) => ({ ...prev, amount: '' }));
      setToAccountInput('');
      setMessage('Transfer submitted successfully.');
      onSuccess();
    } catch (submitError) {
      setError(submitError.message || 'Unable to complete transfer.');
    } finally {
      setBusy('');
    }
  };

  const submitInitialFunds = async (event) => {
    event.preventDefault();
    setBusy('funds');
    setMessage('');
    setError('');

    try {
      await createInitialFunds({
        ...fundForm,
        amount: Number(fundForm.amount),
        idempotencyKey: createIdempotencyKey('initial'),
      });
      setFundForm((prev) => ({ ...prev, amount: '' }));
      setMessage('Initial funds request submitted.');
      onSuccess();
    } catch (submitError) {
      setError(submitError.message || 'Unable to add initial funds.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="stack-lg">
      <div className="section-header">
        <div>
          <h2>Transfer center</h2>
          <p>Transfer funds from one of your accounts to another account number.</p>
        </div>
      </div>

      <div className="form-card">
        <h3>{isSystemUser ? 'Search all accounts' : 'Find recipients'}</h3>
        <input
          placeholder="Search by account name, user name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <p className="sidebar__subtext">{recipientAccounts.length} matching recipient account(s)</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Account Number</th>
              </tr>
            </thead>
            <tbody>
              {recipientAccounts.slice(0, 8).map((account) => (
                <tr key={account._id} onClick={() => setToAccountInput(account.accountNumber || account._id)}>
                  <td>{account.userName || account.userEmail} • {account.name}</td>
                  <td>{account.accountNumber || account._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {message ? <div className="alert alert--success">{message}</div> : null}
      {error ? <div className="alert alert--error">{error}</div> : null}

      <div className="two-col-grid">
        <form className="form-card" onSubmit={submitTransfer}>
          <h3>Create transfer</h3>

          <label>
            From account
            <select
              required
              value={transferForm.fromAccount}
              onChange={(event) => setTransferForm((prev) => ({ ...prev, fromAccount: event.target.value }))}
            >
              {sourceAccounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {sourceLabel(account)}
                </option>
              ))}
            </select>
          </label>

          <label>
            To account number
            <select
              value={toAccountInput}
              onChange={(event) => setToAccountInput(event.target.value)}
              disabled={!availableDestinationAccounts.length}
            >
              {availableDestinationAccounts.length ? (
                availableDestinationAccounts.map((account) => (
                  <option key={account._id} value={account.accountNumber || account._id}>
                    {recipientLabel(account)}
                  </option>
                ))
              ) : (
                <option value="">No destination accounts available</option>
              )}
            </select>
          </label>

          <label>
            Or enter account number manually
            <input
              required
              value={toAccountInput}
              onChange={(event) => setToAccountInput(event.target.value)}
              placeholder="Enter recipient account number"
            />
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

          <button type="submit" disabled={busy === 'transfer' || !sourceAccounts.length}>
            {busy === 'transfer' ? 'Submitting...' : 'Submit transfer'}
          </button>
        </form>

        {isSystemUser ? (
          <form className="form-card" onSubmit={submitInitialFunds}>
            <h3>Add initial funds</h3>

            <label>
              To account
              <select
                required
                value={fundForm.toAccount}
                onChange={(event) => setFundForm((prev) => ({ ...prev, toAccount: event.target.value }))}
              >
                {recipientAccounts.map((account) => (
                  <option key={account._id} value={account.accountNumber || account._id}>
                    {recipientLabel(account)}
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
        ) : null}
      </div>
    </div>
  );
}
