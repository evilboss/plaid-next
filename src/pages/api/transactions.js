import plaidClient from '@/lib/plaid';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { access_token, startDate, endDate } = req.body;
  try {
    const now = new Date();
    const end = endDate || now.toISOString().slice(0, 10);
    const start = startDate || new Date(now.setDate(now.getDate() - 30)).toISOString().slice(0, 10);

    const response = await plaidClient.transactionsGet({
      access_token,
      start_date: start,
      end_date: end,
      options: { count: 10, offset: 0 },
    });
    res.status(200).json({ transactions: response.data.transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
