# Plaid Transaction Demo (Next.js + Tailwind)

A modern demo app that lets users securely connect a (sandbox) bank account using the Plaid API and view recent transactions, styled with Tailwind CSS and built on Next.js.

![screenshot](./screenshot.png) <!-- Add a screenshot if you like -->
---

## Features

- 🔗 **Connect bank account** using Plaid Link (sandbox/test mode)
- 🔐 **Never handles bank credentials directly** (Plaid Link UI handles auth)
- 📋 **Displays recent transactions** in a clean, Plaid-inspired UI
- ⚡️ Built with **Next.js API routes**, modular React components, and Tailwind CSS
- 🧩 **Easy to extend** for production Plaid or other data sources

---

## Getting Started

### 1. **Clone the repository**

```bash
git clone https://github.com:evilboss/plaid-next.git
cd plaid-next
```
###  2. Install dependencies
```bash
npm install
# or
yarn
```

### 3. Set up your Plaid Sandbox keys
Sign up for a free Plaid developer account.

Go to Team Settings > Keys and copy your Client ID and Sandbox Secret.

Create a file called .env in your project root and add:
```ini
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_sandbox_secret
PLAID_ENV=sandbox
```
### 4. Run the local development server
```bash
npm run dev
# or
yarn dev
```
The app will be available at http://localhost:3000.

### Usage
Click "Connect Bank Account" (center button).
In the Plaid Link popup, select any sandbox/test bank (e.g., "Platypus Bank").
After successful connection, recent transactions will appear in the UI.

