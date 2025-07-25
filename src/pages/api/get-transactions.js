// pages/api/get-transactions.js
import plaidClient from '../../lib/plaid';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { public_token } = req.body;
  try {
    const tokenResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const access_token = tokenResponse.data.access_token;

    // Get transactions for last 30 days
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);

    const txRes = await plaidClient.transactionsGet({
      access_token,
      start_date: start.toISOString().slice(0, 10),
      end_date: now.toISOString().slice(0, 10),
      options: { count: 10, offset: 0 },
    });

    res.status(200).json({ transactions: txRes.data.transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
