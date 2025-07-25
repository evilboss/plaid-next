import { useState } from "react";

export default function PlaidLinkButton({ onSuccess }) {
  const [linkToken, setLinkToken] = useState(null);

  // Fetch the link token from backend
  async function createLinkToken() {
    const res = await fetch("/api/create-link-token");
    const data = await res.json();
    setLinkToken(data.link_token);
  }

  // Open Plaid Link
  function openPlaid() {
    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (public_token) => {
        onSuccess(public_token);
      },
      onExit: () => {},
    });
    handler.open();
  }

  return (
    <>
      {!linkToken ? (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={createLinkToken}
        >
          Link Bank Account
        </button>
      ) : (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={openPlaid}
        >
          Connect Bank (Plaid)
        </button>
      )}
      <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
    </>
  );
}
