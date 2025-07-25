import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';

function App() {
  const [linkToken, setLinkToken] = useState();
  const [accessToken, setAccessToken] = useState();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.post('/api/create-link-token').then(res => setLinkToken(res.data.link_token));
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      const res = await axios.post('/api/exchange-public-token', { public_token });
      setAccessToken(res.data.accessToken);

      // Fetch transactions right after
      const txRes = await axios.post('/api/transactions', { access_token: res.data.accessToken });
      setTransactions(txRes.data.transactions);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2146] via-[#303868] to-[#f6f8fa]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center">
          <img
            src="https://cdn.plaid.com/link/v2/stable/assets/brand.svg"
            alt="Plaid"
            className="h-10 mb-6"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">
            Plaid Transaction Demo
          </h1>
          <p className="text-gray-500 mb-8 text-center">
            Securely connect your bank account to view recent transactions.
          </p>
          <button
            onClick={() => open()}
            disabled={!ready}
            className="bg-gradient-to-r from-[#21295c] to-[#45aab8] text-white font-semibold rounded-full px-6 py-3 shadow-lg transition hover:scale-105 hover:from-[#21295c] hover:to-[#2fd680] disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            style={{ minWidth: 220 }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="4" fill="#232d5a" />
                <path d="M6 13.5L10.5 18L18 7.5" stroke="#45aab8" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Connect Bank Account
            </span>
          </button>
        </div>
        {transactions.length > 0 && (
          <>
            <h2 className="font-semibold text-gray-700 text-lg mb-4">Transactions</h2>
            <ul className="divide-y divide-gray-200">
              {transactions.map(tx => (
                <li key={tx.transaction_id} className="flex items-center py-3">
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium">{tx.name}</div>
                    <div className="text-xs text-gray-500">{tx.date}</div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
