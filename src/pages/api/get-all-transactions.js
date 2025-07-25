// pages/api/get-transactions.js
import plaidClient from '../../lib/plaid';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { access_token, start_date, end_date } = req.body;
  if (!access_token) return res.status(400).json({ error: "Missing access_token" });

  try {
    const count = 100;
    let offset = 0;
    let total = 0;
    let allTx = [];

    const now = new Date();
    const end = end_date || now.toISOString().slice(0, 10);
    const start = start_date || new Date(now.setDate(now.getDate() - 365)).toISOString().slice(0, 10);

    do {
      const txRes = await plaidClient.transactionsGet({
        access_token,
        start_date: start,
        end_date: end,
        options: { count, offset },
      });

      allTx = allTx.concat(txRes.data.transactions);
      total = txRes.data.total_transactions;
      offset += count;
    } while (allTx.length < total);

    res.status(200).json({ transactions: allTx });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
