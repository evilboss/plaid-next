// components/TransactionTable.js
export default function TransactionTable({ transactions }) {
  if (!transactions?.length) return null;
  return (
    <table className="w-full bg-white shadow rounded">
      <thead>
      <tr>
        <th className="py-2">Date</th>
        <th>Description</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
      </thead>
      <tbody>
      {transactions.map((tx) => (
        <tr key={tx.transaction_id}>
          <td className="py-2">{tx.date}</td>
          <td>{tx.name}</td>
          <td>{tx.amount < 0 ? "-" : ""}${Math.abs(tx.amount)}</td>
          <td>{tx.pending ? "Pending" : "Posted"}</td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}
