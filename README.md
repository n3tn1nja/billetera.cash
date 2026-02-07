# Billetera

**Billetera** is a free, simple, and secure **non-custodial** Bitcoin Cash (BCH) web wallet. Send and receive BCH with full control of your keys—no sign-up, no personal data, no custodian.

🌐 **Live:** [billetera.cash](https://billetera.cash)

---

## Features

- **Create or import wallet** — Generate a new HD wallet or restore from a 12-word mnemonic (BIP39).
- **Send & receive BCH** — Enter address and amount, or use “Send maximum.” Receive via QR and CashAddr.
- **Balance in BCH, satoshis & USD** — Real-time balance and optional USD value (price from mainnet.cash).
- **Non-custodial & private** — Keys and seed stay in your browser (IndexedDB). No server holds your funds.
- **Derivation paths** — Standard BCH HD path `m/44'/145'/0'/0/0` and optional `m/44'/0'/0'/0/0` (bitcoin.com–compatible).
- **Incoming tx notifications** — Watch your deposit address and get notified when new transactions arrive.
- **Mnemonic management** — Show/hide seed phrase, hide the mnemonic card, or delete the wallet and start over.

---

## Tech Stack

- **Frontend:** HTML, CSS (Bootstrap), JavaScript
- **Wallet & network:** [mainnet.cash](https://mainnet.cash) (mainnet-2.3.13.js)
- **Storage:** IndexedDB via `indexeddb-storage-2.3.13.js` for persistent wallet data
- **UI:** Bootstrap 5, Bootstrap Icons, simple-datatables

No build step—open `index.html` in a browser or serve the folder with any static server.

---

## Running Locally

1. Clone the repo:
   ```bash
   git clone git@github.com:n3tn1nja/billetera.cash.git
   cd billetera.cash
   ```
2. Serve the project (e.g. with Python or Node):
   ```bash
   # Python 3
   python3 -m http.server 8000

   # or Node (npx)
   npx serve .
   ```
3. Open `http://localhost:8000` (or the port your server uses).

---

## Project Structure

```
billetera/
├── index.html          # Main app page
├── main.js             # Wallet logic: create, import, send, balance, UI
├── constants.js        # App constants (e.g. DB seed)
├── assets/
│   ├── css/            # Styles (Bootstrap, custom, datatables)
│   ├── js/             # mainnet.cash, IndexedDB storage, simple-datatables, UI
│   ├── img/            # Logo, icons, QR placeholder, etc.
│   └── vendor/         # Bootstrap, bootstrap-icons, box-icons, remix-icons
└── README.md
```

---

## Security Notes

- **Back up your mnemonic.** If you lose the 12-word seed, funds cannot be recovered.
- **Never share your seed phrase.** Anyone with it can spend your BCH.
- Wallet data is stored in the browser’s IndexedDB; clearing site data will remove the local wallet (restore with the same mnemonic and derivation path if you have a backup).

---

## License

See repository for license information.
