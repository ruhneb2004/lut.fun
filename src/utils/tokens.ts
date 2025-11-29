// Token definitions for Aptos blockchain
// These are the mainnet/testnet token addresses

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoUrl?: string;
}

// Aptos Testnet Token Addresses
export const TOKENS: Token[] = [
  {
    symbol: "APT",
    name: "Aptos Coin",
    decimals: 8,
    address: "0x1::aptos_coin::AptosCoin",
    logoUrl: "/icons/apt.svg",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    // LayerZero USDC on Aptos Testnet
    address: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
    logoUrl: "/icons/usdc.svg",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    // LayerZero USDT on Aptos Testnet
    address: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT",
    logoUrl: "/icons/usdt.svg",
  },
];

// Get token by symbol
export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return TOKENS.find((token) => token.symbol === symbol);
};

// Get token by address
export const getTokenByAddress = (address: string): Token | undefined => {
  return TOKENS.find((token) => token.address === address);
};

// Convert human readable amount to on-chain amount (with decimals)
export const toOnChainAmount = (amount: number, decimals: number): bigint => {
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
};

// Convert on-chain amount to human readable amount
export const fromOnChainAmount = (amount: bigint | number, decimals: number): number => {
  return Number(amount) / Math.pow(10, decimals);
};

// Format token amount for display
export const formatTokenAmount = (amount: number, decimals: number = 2): string => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};
