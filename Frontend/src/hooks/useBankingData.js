import { useCallback, useEffect, useMemo, useState } from 'react';
import { bankingApi } from '../services/api';

export function useBankingData(isAuthenticated, isSystemUser) {
  const api = useMemo(() => bankingApi(), []);
  const [accounts, setAccounts] = useState([]);
  const [transferTargets, setTransferTargets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;

    setError('');
    setIsRefreshing(true);

    try {
      const [accountsResponse, targetsResponse, transactionsResponse] = await Promise.all([
        api.getAccounts({ all: isSystemUser }),
        api.getTransferTargets(),
        api.getTransactions(),
      ]);

      const accountList = accountsResponse.accounts || accountsResponse || [];
      const targetList = targetsResponse.accounts || targetsResponse || [];
      const transactionList = transactionsResponse.transactions || transactionsResponse || [];

      setAccounts(accountList);
      setTransferTargets(targetList);
      setTransactions(transactionList);

      const balanceEntries = await Promise.all(
        accountList.map(async (account) => {
          try {
            const balanceData = await api.getBalance(account._id);
            return [account._id, balanceData.balance ?? 0];
          } catch {
            return [account._id, null];
          }
        }),
      );

      setBalances(Object.fromEntries(balanceEntries));
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load banking data.');
    } finally {
      setIsRefreshing(false);
    }
  }, [api, isAuthenticated, isSystemUser]);

  const searchTransferTargets = useCallback(async (searchText) => {
    if (!isAuthenticated) return;

    try {
      const response = await api.getTransferTargets(searchText);
      setTransferTargets(response.accounts || []);
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to search accounts.');
    }
  }, [api, isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    accounts,
    transferTargets,
    transactions,
    balances,
    isRefreshing,
    error,
    refresh,
    searchTransferTargets,
    setError,
  };
}
