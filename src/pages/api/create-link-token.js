import plaidClient from '@/lib/plaid';

export default async function handler(req, res) {
  const plaidRequest = {
    user: {
      client_user_id: 'test-user', // Use user id/email in prod
    },
    client_name: 'Plaid Test App',
    products: ['transactions'],
    language: 'en',
    country_codes: ['US'],
  };
  try {
    const response = await plaidClient.linkTokenCreate(plaidRequest);
    res.status(200).json({ link_token: response.data.link_token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

