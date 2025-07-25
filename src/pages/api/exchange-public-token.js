import plaidClient from '@/lib/plaid';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { public_token } = req.body;

  if (!public_token) {
    return res.status(400).json({ error: 'Missing public_token in request body' });
  }

  try {
    const plaidResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = plaidResponse.data.access_token;
    // You should store accessToken in your DB associated with the user, if multi-user
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
