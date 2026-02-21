/*
Banking Frontend (Single-file React app)

Features included:
- Login (JWT)
- Dashboard: accounts list + balances
- Transfer form: create transaction
- Initial Funds form (system user)
- Transactions list with status
- Error & success notifications
- Clean Tailwind-based UI (single-file app for quick start)

Assumptions & Notes:
- Backend base URL: set REACT_APP_API_BASE (defaults to http://localhost:3000)
- Endpoints expected (adjust if your backend differs):
  POST  /api/auth/login                -> { email, password } => { token }
  GET   /api/accounts                  -> requires Authorization: Bearer <token>
  GET   /api/accounts/:id/balance      -> returns { balance }
  POST  /api/transactions              -> create transaction { fromAccount, toAccount, amount, idempotencyKey }
  POST  /api/transactions/initial-funds-> create initial funds { toAccount, amount, idempotencyKey }
  GET   /api/transactions              -> list transactions

How to use this file:
1. Create a Vite + React app or CRA. Example with Vite:
   npm create vite@latest banking-frontend -- --template react
   cd banking-frontend
2. Install Tailwind CSS (follow Tailwind docs for Vite). Quick steps:
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   Add the Tailwind directives to src/index.css
   Configure content paths in tailwind.config.js
3. Put this file as src/App.jsx (replace App.jsx), and ensure index.css imports Tailwind.
4. Install any extra deps (none required for this single-file version). Optionally: react-query, axios.
5. Start: npm install && npm run dev

Design notes:
- Uses Tailwind utility classes for a modern, clean look.
- Components are inline to keep one-file simplicity for quick testing.
- For production, split into components, use state management, and add tests.

*/

import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_BASE || "http://localhost:3000";

function authFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(API + path, { ...opts, headers });
}

function useAsync(fn, deps = []) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.resolve()
      .then(() => fn())
      .then((v) => mounted && setValue(v))
      .catch((e) => mounted && setError(e))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { loading, error, value };
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [message, setMessage] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      loadAccounts();
      loadTransactions();
    }
  }, []);

  async function login(email, password) {
    try {
      const res = await fetch(API + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      localStorage.setItem("token", data.token);
      setUserEmail(email);
      setMessage({ type: "success", text: "Logged in" });
      await loadAccounts();
      await loadTransactions();
      setPage("dashboard");
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Login error" });
    }
  }

  async function logout() {
    localStorage.removeItem("token");
    setAccounts([]);
    setTransactions([]);
    setSelectedAccount(null);
    setPage("login");
    setMessage({ type: "info", text: "Logged out" });
  }

  async function loadAccounts() {
    try {
      const res = await authFetch("/api/accounts");
      if (!res.ok) throw new Error("Failed to load accounts");
      const data = await res.json();
      setAccounts(data.accounts || data);
      if ((data.accounts || data).length) setSelectedAccount((data.accounts || data)[0]._id);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function loadTransactions() {
    try {
      const res = await authFetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to load transactions");
      const data = await res.json();
      setTransactions(data.transactions || data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function fetchBalance(accountId) {
    try {
      const res = await authFetch(`/api/accounts/${accountId}/balance`);
      if (!res.ok) throw new Error("Failed to load balance");
      const data = await res.json();
      return data.balance ?? 0;
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      return 0;
    }
  }

  async function createTransaction(payload) {
    try {
      const res = await authFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Transaction failed");
      setMessage({ type: "success", text: "Transaction successful" });
      await loadTransactions();
      await loadAccounts();
      return data;
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      throw err;
    }
  }

  async function createInitialFunds(payload) {
    try {
      const res = await authFetch("/api/transactions/system/initial-funds", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Initial funds failed");
      setMessage({ type: "success", text: "Initial funds created" });
      await loadTransactions();
      await loadAccounts();
      return data;
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      throw err;
    }
  }

  if (!localStorage.getItem("token")) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-semibold mb-4">Banking Portal</h1>
          <LoginForm onLogin={login} />
          {message && <Flash message={message} onClose={() => setMessage(null)} />}
          <p className="text-sm text-gray-500 mt-4">Use your backend's /api/auth/login to authenticate.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        <Header userEmail={userEmail} onLogout={logout} />

        <div className="grid grid-cols-12 gap-6 mt-6">
          <aside className="col-span-3 bg-white rounded-xl p-4 shadow">
            <h3 className="font-semibold mb-3">Accounts</h3>
            <ul className="space-y-2">
              {accounts.map((acc) => (
                <li key={acc._id} className={`p-3 rounded-md hover:bg-slate-50 cursor-pointer ${selectedAccount === acc._id ? 'bg-sky-50 border border-sky-100' : ''}`} onClick={() => setSelectedAccount(acc._id)}>
                  <div className="text-sm font-medium">{acc._id}</div>
                  <div className="text-xs text-gray-500">{acc.currency}</div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <button onClick={() => setPage('transfer')} className="w-full py-2 rounded-md bg-sky-600 text-white">New Transfer</button>
            </div>

            <div className="mt-3">
              <button onClick={() => setPage('initial')} className="w-full py-2 rounded-md border border-slate-200">Initial Funds (system)</button>
            </div>
          </aside>

          <main className="col-span-9">
            <div className="bg-white rounded-xl p-6 shadow">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{page === 'dashboard' ? 'Dashboard' : page === 'transfer' ? 'Create Transfer' : 'Initial Funds'}</h2>
                <div>
                  <button onClick={() => { setPage('dashboard'); loadAccounts(); loadTransactions(); }} className="px-3 py-1 rounded-md border">Refresh</button>
                </div>
              </div>

              <div className="mt-4">
                {page === 'dashboard' && (
                  <Dashboard accounts={accounts} selectedAccount={selectedAccount} onRefresh={loadAccounts} fetchBalance={fetchBalance} transactions={transactions} />
                )}

                {page === 'transfer' && (
                  <TransferForm accounts={accounts} defaultFrom={selectedAccount} onSubmit={createTransaction} onDone={() => { setPage('dashboard'); loadTransactions(); loadAccounts(); }} />
                )}

                {page === 'initial' && (
                  <InitialFundsForm accounts={accounts} onSubmit={createInitialFunds} onDone={() => { setPage('dashboard'); loadTransactions(); loadAccounts(); }} />
                )}

                <hr className="my-6" />

                <h3 className="font-semibold mb-3">Recent Transactions</h3>
                <TransactionsList items={transactions} />

              </div>
            </div>
          </main>
        </div>

        {message && <Flash message={message} onClose={() => setMessage(null)} />}
      </div>
    </div>
  );
}

/* --- UI components (inline for single-file convenience) --- */

function Header({ userEmail, onLogout }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold">B</div>
        <div>
          <div className="text-lg font-semibold">Banking Portal</div>
          <div className="text-sm text-gray-500">{userEmail || 'User'}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onLogout} className="px-3 py-2 rounded-md border">Sign out</button>
      </div>
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form onSubmit={e => { e.preventDefault(); onLogin(email, password); }} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm text-gray-600">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
      </div>
      <div>
        <button type="submit" className="w-full py-2 rounded-md bg-sky-600 text-white">Sign in</button>
      </div>
    </form>
  );
}

function Flash({ message, onClose }) {
  const bg = message.type === 'error' ? 'bg-red-50 border-red-200' : message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-sky-50 border-sky-200';
  return (
    <div className={`fixed right-6 bottom-6 p-4 rounded-md border ${bg}`}>
      <div className="flex items-start gap-4">
        <div className="font-semibold">{message.type.toUpperCase()}</div>
        <div className="text-sm text-gray-700">{message.text}</div>
        <button onClick={onClose} className="ml-4 text-gray-400">✕</button>
      </div>
    </div>
  );
}

function Dashboard({ accounts, selectedAccount, fetchBalance, transactions, onRefresh }) {
  const [balances, setBalances] = useState({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      const map = {};
      for (const a of accounts) {
        const b = await fetchBalance(a._id);
        map[a._id] = b;
      }
      if (mounted) setBalances(map);
    }
    load();
    return () => mounted = false;
  }, [accounts]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {accounts.map(a => (
          <div key={a._id} className={`p-4 rounded-md border ${selectedAccount === a._id ? 'border-sky-300' : 'border-slate-100'}`}>
            <div className="text-sm text-gray-500">Account</div>
            <div className="font-semibold mt-1">{a._id}</div>
            <div className="text-xs text-gray-400 mt-2">{a.currency}</div>
            <div className="mt-3 text-lg">₹ {balances[a._id] ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Recent activity</h3>
        <div className="mt-3 space-y-2">
          {transactions.slice(0, 6).map(t => (
            <div key={t._id} className="p-3 rounded-md border">
              <div className="text-sm">{t._id}</div>
              <div className="text-xs text-gray-500">{t.status} • {t.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TransferForm({ accounts, defaultFrom, onSubmit, onDone }) {
  const [from, setFrom] = useState(defaultFrom || (accounts[0] && accounts[0]._id));
  const [to, setTo] = useState(accounts[1] && accounts[1]._id);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setFrom(defaultFrom); }, [defaultFrom]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const idempotencyKey = Math.random().toString(36).slice(2) + Date.now();
      await onSubmit({ fromAccount: from, toAccount: to, amount: Number(amount), idempotencyKey });
      onDone();
    } catch (err) {
      // handled by parent
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600">From</label>
          <select value={from} onChange={e => setFrom(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
            {accounts.map(a => <option key={a._id} value={a._id}>{a._id}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600">To</label>
          <select value={to} onChange={e => setTo(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
            {accounts.map(a => <option key={a._id} value={a._id}>{a._id}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Amount</label>
        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-64 mt-1 p-2 border rounded-md" />
      </div>

      <div>
        <button disabled={loading} className="px-4 py-2 rounded-md bg-sky-600 text-white">Send</button>
      </div>
    </form>
  );
}

function InitialFundsForm({ accounts, onSubmit, onDone }) {
  const [to, setTo] = useState(accounts[0] && accounts[0]._id);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const idempotencyKey = 'initial-' + Math.random().toString(36).slice(2) + Date.now();
      await onSubmit({ toAccount: to, amount: Number(amount), idempotencyKey });
      onDone();
    } catch (err) {
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4 mt-4">
      <div>
        <label className="block text-sm text-gray-600">To</label>
        <select value={to} onChange={e => setTo(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
          {accounts.map(a => <option key={a._id} value={a._id}>{a._id}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600">Amount</label>
        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-64 mt-1 p-2 border rounded-md" />
      </div>
      <div>
        <button disabled={loading} className="px-4 py-2 rounded-md bg-sky-600 text-white">Create</button>
      </div>
    </form>
  );
}

function TransactionsList({ items }) {
  if (!items || !items.length) return <div className="text-sm text-gray-500">No transactions yet.</div>;
  return (
    <div className="space-y-2">
      {items.map(t => (
        <div key={t._id} className="p-3 rounded-md border flex justify-between items-center">
          <div>
            <div className="font-mono text-xs">{t._id}</div>
            <div className="text-sm">{t.type || `${t.fromAccount || ''} → ${t.toAccount || ''}`}</div>
            <div className="text-xs text-gray-500">{t.status} • {t.amount}</div>
          </div>
          <div className="text-right text-xs text-gray-400">{new Date(t.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

/*
End of single-file App.jsx
*/
