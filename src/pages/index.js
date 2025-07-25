import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';

function App() {
  const [linkToken, setLinkToken] = useState();
  const [accessToken, setAccessToken] = useState();
  const [transactions, setTransactions] = useState([]);
  const [institution, setInstitution] = useState();

  useEffect(() => {
    axios.post('/api/create-link-token')
      .then(res => setLinkToken(res.data.link_token));
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      setInstitution(metadata.institution);
      const res = await axios.post('/api/exchange-public-token', { public_token });
      setAccessToken(res.data.accessToken);

      // Fetch transactions after linking
      const txRes = await axios.post('/api/transactions', { access_token: res.data.accessToken });
      setTransactions(txRes.data.transactions);
    },
  });

  function getBankLogo(institution) {
    if (!institution) return null;
    if (institution.logo) return institution.logo;
    if (institution.url) return `https://logo.clearbit.com/${institution.url}`;
    return `https://logo.clearbit.com/${institution.name.replace(/\s/g, '').toLowerCase()}.com`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2146] via-[#303868] to-[#f6f8fa]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl">
        <div className="flex flex-col items-center mb-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Plaid_logo.svg"
            alt="Plaid"
            className="h-10 mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">
            Plaid Transaction Demo
          </h1>
          <p className="text-gray-500 mb-4 text-center">
            Securely connect your bank account to view recent transactions.
          </p>
          <button
            onClick={() => open()}
            disabled={!ready}
            className="bg-gradient-to-r from-[#21295c] to-[#45aab8] text-white font-semibold rounded-full px-6 py-3 shadow-lg transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            style={{ minWidth: 220 }}
          >
            Connect Bank Account
          </button>
        </div>

        {/* Institution logo and name just above table */}
        {institution && transactions.length > 0 && (
          <div className="flex flex-col items-center mb-6">
            <img
              src={getBankLogo(institution)}
              alt={institution.name}
              className="h-12 mb-2 rounded shadow"
              onError={e => (e.target.style.display = 'none')}
            />
            <div className="font-semibold text-gray-700 text-base">{institution.name}</div>
            <div className="text-gray-400 text-xs">Transactions are simulated in Plaid Sandbox.</div>
          </div>
        )}

        {/* Transaction Table */}
        {transactions.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow rounded">
                <caption className="caption-top mb-2 text-left text-gray-700 font-medium">
                  Recent Transactions
                </caption>
                <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-2 text-left text-gray-800">Date</th>
                  <th className="px-2 text-left text-gray-800">Description</th>
                  <th className="px-2 text-right text-gray-800">Spent</th>
                  <th className="px-2 text-right text-gray-800">Received</th>
                  <th className="px-2 text-center text-gray-800">Status</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.transaction_id} className="border-t text-gray-800">
                    <td className="py-2 px-2 font-mono">{tx.date}</td>
                    <td className="px-2">{tx.name}</td>
                    <td className="px-2 text-red-500 font-semibold text-right">
                      {tx.amount < 0 ? `$${Math.abs(tx.amount).toFixed(2)}` : ""}
                    </td>
                    <td className="px-2 text-green-600 font-semibold text-right">
                      {tx.amount > 0 ? `$${tx.amount.toFixed(2)}` : ""}
                    </td>
                    <td className="px-2 text-center">
                      {tx.pending ? (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                            Pending
                          </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            Posted
                          </span>
                      )}
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
              <div className="text-xs text-gray-800 mt-2">
                Amounts in <span className="font-semibold">Spent</span> are money out; <span className="font-semibold">Received</span> are money in.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
