import EmptyState from '../components/EmptyState';

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
              {transactions.map((item) => (
                <tr key={item._id}>
                  <td>{item._id}</td>
                  <td>{item.fromAccount || '-'}</td>
                  <td>{item.toAccount || '-'}</td>
                  <td>
                    <span className={`badge badge--${item.status || 'pending'}`}>{item.status || 'unknown'}</span>
                  </td>
                  <td>${Number(item.amount || 0).toFixed(2)}</td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
