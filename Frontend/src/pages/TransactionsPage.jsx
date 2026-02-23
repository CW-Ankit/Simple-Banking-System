import EmptyState from '../components/EmptyState';

function accountLabel(account) {
  if (!account) return '-';
  if (typeof account === 'string') return account;

  return account.userName || account.userEmail || account.accountNumber || account._id || '-';
}

export default function TransactionsPage({ transactions }) {
  return (
    <div className="stack-md">
      <h2>All transactions</h2>

      {!transactions.length ? (
        <EmptyState
          title="No transactions yet"
          description="Completed and pending transaction records from the backend will render here."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => {
                const status = (item.status || 'pending').toLowerCase();

                return (
                  <tr key={item._id}>
                    <td>{item._id}</td>
                    <td>{accountLabel(item.fromAccount)}</td>
                    <td>{accountLabel(item.toAccount)}</td>
                    <td>
                      <span className={`badge badge--${status}`}>{status}</span>
                    </td>
                    <td>${Number(item.amount || 0).toFixed(2)}</td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
