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
          <Route path="accounts" element={<AccountsPage accounts={accounts} balances={balances} />} />
          <Route
            path="transfers"
            element={
              <TransfersPage
                accounts={accounts}
                createTransfer={createTransfer}
                createInitialFunds={createInitialFunds}
                onSuccess={refresh}
              />
            }
          />
          <Route path="transactions" element={<TransactionsPage transactions={transactions} />} />
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
