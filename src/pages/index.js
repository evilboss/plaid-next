import { useState, useEffect, useCallback } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import axios from 'axios'

function App () {
  const [linkToken, setLinkToken] = useState()
  const [accessToken, setAccessToken] = useState()
  const [transactions, setTransactions] = useState([])
  const [institution, setInstitution] = useState()
  const [startDate, setStartDate] = useState('') // The only date input
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    axios.post('/api/create-link-token')
      .then(res => setLinkToken(res.data.link_token))
  }, [])

  const fetchTransactions = useCallback(async (accessTokenArg, startDateArg) => {
    if (!accessTokenArg) return
    setLoading(true)
    const txRes = await axios.post('/api/get-all-transactions', {
      access_token: accessTokenArg,
      start_date: startDateArg || undefined,
    }).finally(() => setLoading(false))
    setTransactions(txRes.data.transactions || [])
  }, [])

  // Plaid Link config
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      setInstitution(metadata.institution)
      const res = await axios.post('/api/exchange-public-token', { public_token })
      setAccessToken(res.data.accessToken)

      // Fetch transactions using selected start date (if any)
      fetchTransactions(res.data.accessToken, startDate)
    },
  })

  // Whenever startDate changes (and already linked), refetch
  useEffect(() => {
    if (accessToken) {
      fetchTransactions(accessToken, startDate)
    }
  }, [startDate, accessToken, fetchTransactions])

  function getBankLogo (institution) {
    if (!institution) return null
    if (institution.logo) return institution.logo
    if (institution.url) return `https://logo.clearbit.com/${institution.url}`
    return `https://logo.clearbit.com/${institution.name.replace(/\s/g, '').toLowerCase()}.com`
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2146] via-[#303868] to-[#f6f8fa]">
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
          {/* Start Date Picker */}
          <div className="mb-2 flex flex-col items-center w-full">
            <label htmlFor="start-date-init" className="text-sm font-medium text-gray-700">
              (Optional) Only fetch transactions from this date:
            </label>
            <input
              type="date"
              id="start-date-init"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="
              w-56
              px-4 py-2
              rounded-xl
              border border-gray-300
              bg-gray-50
              text-gray-800
              focus:outline-none focus:ring-2 focus:ring-[#45aab8] focus:border-[#45aab8]
              shadow-md
              transition
              placeholder-gray-400
              hover:border-[#21295c] hover:bg-white
              disabled:bg-gray-100 disabled:text-gray-400
              mt-1
              "
              max={new Date().toISOString().slice(0, 10)}
            />
            <span className="text-xs text-gray-400 mt-1">
              Leave blank to fetch up to one year of history.
            </span>
          </div>
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
        {loading && (
          <div className="flex flex-col items-center py-12">
            <svg className="animate-spin h-10 w-10 text-[#45aab8] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <div className="text-[#45aab8] font-medium text-lg">Loading transactions…</div>
          </div>
        )}
        {!loading && institution && transactions.length > 0 && (
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
        {!loading && transactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow rounded">
              <caption className="caption-top mb-2 text-left text-gray-700 font-medium">
                Recent Transactions
              </caption>
              <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="py-3 px-2 text-left">Date</th>
                <th className="px-2 text-left">Description</th>
                <th className="px-2 text-right">Spent</th>
                <th className="px-2 text-right">Received</th>
                <th className="px-2 text-center">Status</th>
              </tr>
              </thead>
              <tbody>
              {transactions.map((tx) => (
                <tr key={tx.transaction_id} className="border-t text-gray-600">
                  <td className="py-2 px-2 font-mono">{tx.date}</td>
                  <td className="px-2">{tx.name}</td>
                  <td className="px-2 text-red-500 font-semibold text-right">
                    {tx.amount < 0 ? `$${Math.abs(tx.amount).toFixed(2)}` : ''}
                  </td>
                  <td className="px-2 text-green-600 font-semibold text-right">
                    {tx.amount > 0 ? `$${tx.amount.toFixed(2)}` : ''}
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
            <div className="text-xs text-gray-400 mt-2">
              Amounts in <span className="font-semibold">Spent</span> are money out; <span
              className="font-semibold">Received</span> are money in.
            </div>
          </div>
        )}

        {/* No transactions */}
        {institution && transactions.length === 0 && (
          <div className="text-center text-gray-600 mt-8">
            No transactions found for this account for this selected start date.
          </div>
        )}
      </div>
    </div>
  )
}

export default App
