# LUT.FUN - No-Loss on Aptos

<div align="center">

![LUT.FUN Banner](https://img.shields.io/badge/Built%20on-Aptos-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)

**Deposit USDC/APT to win prizes, rewards, and contribute to a good cause — without ever losing your principal!**

[Demo](#demo) • [Features](#features) • [How It Works](#how-it-works) • [Architecture](#architecture) • [Getting Started](#getting-started)

</div>

---

## 🎯 Problem Statement

Why does a $370B+ global lottery market still rely on centralized operators that control everything? 

Why do these operators take 60–70% of the total value, leaving players with poor odds?

Any Answers 

1. **Complete Loss of Principal**: Players lose 100% of their deposited funds when they don't win
2. **Lack of Transparency**: Centralized systems with opaque winner selection processes
3. **No Yield Generation**: Deposited funds sit idle, generating no returns for participants
4. **Trust Issues**: Users must trust centralized entities to fairly distribute prizes
5. **High Barrier to Entry**: Complex systems that exclude newcomers to crypto/DeFi

## 💡 Our Solution

**LUT.FUN** is a revolutionary **No-Loss Lottery** platform built on the Aptos blockchain that solves all these problems:

- 🛡️ **Principal Protection**: Your deposit is NEVER at risk — losers get their full deposit back
- 🎲 **Fair Winner Selection**: On-chain randomness ensures transparent and verifiable winner picking
- 💰 **Yield-Based Prizes**: Pool funds are staked in DeFi protocols (Echelon, Aave) to generate yield
- 🏆 **Winners Get Yield**: The generated yield (7.7%+ APY) goes to the winner as their prize
- 🔗 **Fully Decentralized**: All operations happen on-chain with smart contracts
- 🎨 **Custom Lottery Creation**: Anyone can create their own lottery pools with custom parameters, entry limits, and prize structures
- 🌐 **Cross-Chain Support**: Deposit tokens from multiple blockchains via Flare Network's cross-chain bridge — participate from Ethereum, BSC, Polygon, and more

---

## ✨ Features

### 🎮 Core Features

| Feature | Description |
|---------|-------------|
| **No-Loss Pools** | Create and join lottery pools where principal is always protected |
| **Yield Generation** | Deposits are staked in Echelon/Aave protocols to generate yield |
| **On-Chain Randomness** | Transparent winner selection using blockchain randomness |
| **Multi-Token Support** | Support for APT, USDC, and USDT tokens |
| **Weekly Draws** | Automatic pool resolution after 7-day periods |
| **Multi-Chain Token Support** | Bridge and deposit tokens from multiple chains via Flare Network's cross-chain bridge |

### 🏗️ Technical Features

- **Smart Contract Security**: Move language contracts with comprehensive error handling
- **Real-time Updates**: React Query for live data synchronization
- **Wallet Integration**: Seamless Aptos wallet adapter integration
- **PWA Support**: Install as a Progressive Web App for mobile experience
- **Demo Mode**: Test the platform without real blockchain transactions

### 📊 Pool Management

- Create custom lottery pools with configurable parameters
- Set minimum/maximum entry amounts
- Track pool participants and total deposits
- View real-time pool statistics and yield estimates

---

## 🔄 How It Works

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              LUT.FUN COMPLETE FLOW                                   │
└──────────────────────────────────────────────────────────────────────────────────────┘

     ┌─────────────────┐
     │  Users deposit  │
     │   any token     │
     │  (APT/USDC/USDT)│
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐         ┌─────────────────────────────────────────┐
     │   Move into     │         │        LLM ROUTER                       │
     │   respective    │────────▶│  Analyzes which lending pool offers     │
     │     pools       │         │  best APY and routes principal amount   │
     └────────┬────────┘         └────────────────┬────────────────────────┘
              │                                   │
              ▼                                   ▼
     ┌─────────────────┐              ┌──────────────────────┐
     │  Users receive  │              │    DeFi Protocols    │
     │  lottery tickets│              │  ┌────────────────┐  │
     │  based on       │              │  │    Echelon     │  │
     │  deposit amount │              │  └────────────────┘  │
     └─────────────────┘              │  ┌────────────────┐  │
                                      │  │      Aave      │  │
                                      │  └────────────────┘  │
                                      └──────────┬───────────┘
                                                 │
                                                 │ Yield Generated (~7.7% APY)
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           VESTING PERIOD COMPLETE                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
                              ┌──────────────────────────────────┐
                              │      🔗 FLARE NETWORK            │
                              │  ┌────────────────────────────┐  │
                              │  │ FTSO Price Feeds           │  │
                              │  │ (accurate token pricing)   │  │
                              │  └────────────────────────────┘  │
                              │  ┌────────────────────────────┐  │
                              │  │ Random Number Generator    │  │
                              │  │ (fair winner selection)    │  │
                              │  └────────────────────────────┘  │
                              │  ┌────────────────────────────┐  │
                              │  │ Bridge to Other Assets     │  │
                              │  │ (cross-chain capability)   │  │
                              │  └────────────────────────────┘  │
                              └───────────────┬──────────────────┘
                                              │
                                              ▼
                              ┌──────────────────────────────────┐
                              │        👑 MANAGER                │
                              │  • Claims yield from protocols   │
                              │  • Moves yield to claim vault    │
                              │  • Triggers winner selection     │
                              │  • Distributes prize to winner   │
                              └───────────────┬──────────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
              ┌─────────────────────┐                   ┌─────────────────────┐
              │    🏆 WINNER        │                   │    😊 LOSERS        │
              │  Principal + Yield  │                   │  100% Principal     │
              │  deposited to wallet│                   │  returned to wallet │
              └─────────────────────┘                   └─────────────────────┘
```

### Step-by-Step Process

| Step | Action | Description |
|------|--------|-------------|
| **1** | 💰 **User Deposit** | Users deposit any supported token (APT, USDC, USDT) into the lottery |
| **2** | 🏊 **Pool Allocation** | Deposits are moved into respective lottery pools |
| **3** | 🎫 **Ticket Issuance** | Users receive lottery tickets proportional to their deposit amount |
| **4** | 🤖 **LLM Router** | AI-powered router analyzes DeFi protocols to find the best APY and routes funds accordingly |
| **5** | 📈 **Yield Generation** | Principal is staked in Echelon/Aave protocols to generate ~7.7% APY |
| **6** | ⏳ **Vesting Period** | Funds remain staked for the lottery duration (7 days) |
| **7** | 🔗 **Flare Network Integration** | Leverages Flare's enshrined data protocols for fair randomness and accurate pricing |
| **8** | 🎲 **Winner Selection** | Random winner picked using Flare's verifiable random number generator |
| **9** | 👑 **Prize Distribution** | Manager claims yield and transfers prize to winner's wallet |
| **10** | 💸 **Principal Return** | All losers receive 100% of their original deposit back |

### 🔗 Flare Network Integration

LUT.FUN leverages **Flare Network's enshrined data protocols** for critical operations:

| Protocol | Purpose |
|----------|---------|
| **FTSO (Flare Time Series Oracle)** | Real-time, decentralized price feeds for accurate token valuations |
| **Random Number Generator** | Verifiable, tamper-proof randomness for fair winner selection |
| **Cross-Chain Bridge** | Enables bridging to other assets and multi-chain support |

---

## 🏛️ Architecture

### Smart Contracts (Move)

```
contract/sources/
├── pool.move          # Individual lottery pool logic
├── pool_factory.move  # Pool creation and management
├── pool_staking.move  # DeFi integration (Echelon/Aave)
├── prize_pool.move    # Prize distribution logic
└── manager.move       # Administrative functions
```

### Frontend (Next.js)

```
src/
├── app/               # Next.js app router pages
├── components/        # React components
├── hooks/             # Custom React hooks for blockchain
├── lib/               # Database and utilities
├── utils/             # Aptos client and ABIs
└── view-functions/    # Blockchain view functions
```

### Key Smart Contract Modules

| Module | Purpose |
|--------|---------|
| `safebet::pool` | Handles deposits, withdrawals, and participant tracking |
| `safebet::pool_staking` | Manages DeFi staking with Echelon/Aave protocols |
| `safebet::prize_pool` | Distributes prizes to winners and returns principal to losers |
| `safebet::manager` | Pool lifecycle management and admin functions |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Aptos Wallet (Petra, Martian, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/ruhneb2004/lut.fun.git
cd lut.fun

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

### Smart Contract Deployment

```bash
# Compile Move contracts
npm run move:compile

# Run tests
npm run move:test

# Deploy to testnet/mainnet
npm run move:publish
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to Vercel |
| `npm run move:compile` | Compile Move contracts |
| `npm run move:test` | Run Move unit tests |
| `npm run move:publish` | Publish contracts to chain |
| `npm run move:upgrade` | Upgrade existing contracts |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Blockchain** | Aptos |
| **Smart Contracts** | Move Language |
| **Frontend** | Next.js 14, React 18 |
| **Styling** | Tailwind CSS, shadcn/ui |
| **State Management** | React Query (TanStack) |
| **Database** | Supabase |
| **Wallet** | Aptos Wallet Adapter |
| **DeFi Protocols** | Echelon Protocol, Aave |

---

## 🔐 Security Features

- ✅ Non-custodial: Users maintain control of funds until deposit
- ✅ Auditable: All transactions visible on-chain
- ✅ Protected Principal: Smart contract ensures losers get funds back
- ✅ Transparent Randomness: Verifiable on-chain winner selection
- ✅ Time-locked Draws: Prevents manipulation with enforced draw periods

---

## 🗺️ Roadmap

- [x] Core smart contracts (Pool, Staking, Prize Distribution)
- [x] Web application with wallet integration
- [x] Echelon Protocol integration for yield
- [x] Demo mode for testing
- [ ] Multi-chain support (Sui, Solana)
- [ ] Mobile app (React Native)
- [ ] Governance token
- [ ] DAO-controlled parameters
- [ ] Additional DeFi protocol integrations

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Aptos Labs](https://aptoslabs.com/) for the amazing blockchain infrastructure
- [Echelon Protocol](https://echelon.market/) for DeFi lending integration
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

---

<div align="center">

**Built with ❤️ for the Aptos ecosystem**

[Website](https://lut.fun) • [Twitter](https://twitter.com/lutfun) • [Discord](https://discord.gg/lutfun)

</div>
