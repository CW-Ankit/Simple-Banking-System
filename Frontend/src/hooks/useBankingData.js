import { useCallback, useEffect, useMemo, useState } from 'react';
import { bankingApi } from '../services/api';

<<<<<<< HEAD
export function useBankingData(isAuthenticated) {
  const api = useMemo(() => bankingApi(), []);
  const [accounts, setAccounts] = useState([]);
=======
export function useBankingData(isAuthenticated, isSystemUser) {
  const api = useMemo(() => bankingApi(), []);
  const [accounts, setAccounts] = useState([]);
  const [transferTargets, setTransferTargets] = useState([]);
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;

    setError('');
    setIsRefreshing(true);

    try {
<<<<<<< HEAD
      const [accountsResponse, transactionsResponse] = await Promise.all([
        api.getAccounts(),
=======
      const [accountsResponse, targetsResponse, transactionsResponse] = await Promise.all([
        api.getAccounts({ all: isSystemUser }),
        api.getTransferTargets(),
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
        api.getTransactions(),
      ]);

      const accountList = accountsResponse.accounts || accountsResponse || [];
<<<<<<< HEAD
      const transactionList = transactionsResponse.transactions || transactionsResponse || [];

      setAccounts(accountList);
=======
      const targetList = targetsResponse.accounts || targetsResponse || [];
      const transactionList = transactionsResponse.transactions || transactionsResponse || [];

      setAccounts(accountList);
      setTransferTargets(targetList);
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
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
<<<<<<< HEAD
=======
  }, [api, isAuthenticated, isSystemUser]);

  const searchTransferTargets = useCallback(async (searchText) => {
    if (!isAuthenticated) return;

    try {
      const response = await api.getTransferTargets(searchText);
      setTransferTargets(response.accounts || []);
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to search accounts.');
    }
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
  }, [api, isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    accounts,
<<<<<<< HEAD
=======
    transferTargets,
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
    transactions,
    balances,
    isRefreshing,
    error,
    refresh,
<<<<<<< HEAD
=======
    searchTransferTargets,
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
    setError,
  };
}
