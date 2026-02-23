<<<<<<< HEAD
=======
import { useEffect, useMemo, useState } from 'react';
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import AccountsPage from './pages/AccountsPage';
import TransfersPage from './pages/TransfersPage';
import TransactionsPage from './pages/TransactionsPage';
import NotFoundPage from './pages/NotFoundPage';
<<<<<<< HEAD
import { useBankingData } from './hooks/useBankingData';
import { bankingApi } from './services/api';

function DashboardRoutes() {
  const { isAuthenticated } = useAuth();
  const { accounts, transactions, balances, isRefreshing, error, refresh } = useBankingData(isAuthenticated);
  const api = bankingApi();

  const createTransfer = async (payload) => {
    await api.createTransfer(payload);
  };

  const createInitialFunds = async (payload) => {
    await api.createInitialFunds(payload);
=======
import AdminUsersPage from './pages/AdminUsersPage';
import { useBankingData } from './hooks/useBankingData';
import { adminApi, bankingApi } from './services/api';

function DashboardRoutes() {
  const { isAuthenticated, isSystemUser } = useAuth();
  const { accounts, transferTargets, transactions, balances, isRefreshing, error, refresh, searchTransferTargets } = useBankingData(isAuthenticated, isSystemUser);
  const bankApi = useMemo(() => bankingApi(), []);
  const admApi = useMemo(() => adminApi(), []);

  const [users, setUsers] = useState([]);

  const loadUsers = async (search = "") => {
    if (!isSystemUser) return;
    const response = await admApi.getUsers(search);
    setUsers(response.users || []);
  };

  useEffect(() => {
    loadUsers();
  }, [isSystemUser]);

  const createTransfer = async (payload) => {
    await bankApi.createTransfer(payload);
  };

  const createInitialFunds = async (payload) => {
    await bankApi.createInitialFunds(payload);
  };

  const onCreateAccount = async (payload) => {
    await bankApi.createAccount(payload);
    await refresh();
  };

  const onRenameAccount = async (accountId, name) => {
    await bankApi.updateAccount(accountId, { name });
    await refresh();
  };

  const onDeleteAccount = async (accountId) => {
    await bankApi.deleteAccount(accountId);
    await refresh();
  };

  const onCreateUser = async (payload) => {
    await admApi.createUser(payload);
    await loadUsers();
  };

  const onUpdateUser = async (userId, payload) => {
    await admApi.updateUser(userId, payload);
    await loadUsers();
  };

  const onDeleteUser = async (userId) => {
    await admApi.deleteUser(userId);
    await loadUsers();
    await refresh();
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
  };

  return (
    <>
      {error ? <div className="global-alert">{error}</div> : null}
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route
            index
            element={
              <OverviewPage
                accounts={accounts}
                balances={balances}
                transactions={transactions}
                isRefreshing={isRefreshing}
                refresh={refresh}
              />
            }
          />
<<<<<<< HEAD
          <Route path="accounts" element={<AccountsPage accounts={accounts} balances={balances} />} />
=======
          <Route
            path="accounts"
            element={
              <AccountsPage
                accounts={accounts}
                balances={balances}
                onCreateAccount={onCreateAccount}
                onRenameAccount={onRenameAccount}
                onDeleteAccount={onDeleteAccount}
                isSystemUser={isSystemUser}
                users={users}
              />
            }
          />
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
          <Route
            path="transfers"
            element={
              <TransfersPage
<<<<<<< HEAD
                accounts={accounts}
                createTransfer={createTransfer}
                createInitialFunds={createInitialFunds}
                onSuccess={refresh}
=======
                sourceAccounts={accounts}
                targetAccounts={transferTargets}
                createTransfer={createTransfer}
                createInitialFunds={createInitialFunds}
                onSuccess={refresh}
                isSystemUser={isSystemUser}
                onSearchTargets={searchTransferTargets}
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
              />
            }
          />
          <Route path="transactions" element={<TransactionsPage transactions={transactions} />} />
<<<<<<< HEAD
=======
          <Route
            path="admin/users"
            element={
              isSystemUser ? (
                <AdminUsersPage
                  users={users}
                  onCreateUser={onCreateUser}
                  onUpdateUser={onUpdateUser}
                  onDeleteUser={onDeleteUser}
                  onSearchUsers={loadUsers}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/*" element={<DashboardRoutes />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
