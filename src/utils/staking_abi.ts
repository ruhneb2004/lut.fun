// Staking ABI for SafeBet multi-protocol staking
// Supports: Echelon Protocol (primary), Aave (simulated fallback)

// Protocol identifiers
export const PROTOCOL_AAVE = 0;
export const PROTOCOL_ECHELON = 1;

// Echelon Protocol Contract Address (Aptos Mainnet)
export const ECHELON_CONTRACT_ADDRESS = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";

// Protocol names for display
export const PROTOCOL_NAMES: Record<number, string> = {
  [PROTOCOL_AAVE]: "Aave",
  [PROTOCOL_ECHELON]: "Echelon",
};

export const POOL_STAKING_ABI = {
  address:
    process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0xb339b0b5ea892c5e3f24a0a62e22319d17d0ec6f7dff905314c6e5e9755b88ae",
  name: "pool_staking",
  friends: [],
  exposed_functions: [
    // Core staking functions
    {
      name: "stake_to_echelon",
      visibility: "public",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "address", "0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],
      return: [],
    },
    {
      name: "stake_to_aave",
      visibility: "public",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "address", "0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],
      return: [],
    },
    {
      name: "stake_to_best_protocol",
      visibility: "public",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "address", "0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],
      return: [],
    },
    {
      name: "unstake_from_echelon",
      visibility: "public",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "address"],
      return: ["0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],
    },
    {
      name: "unstake_from_aave",
      visibility: "public",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "address"],
      return: ["0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],
    },
    {
      name: "unstake",
      visibility: "public",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "address"],
      return: ["0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],
    },
    // Admin functions
    {
      name: "set_default_protocol",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "u8"],
      return: [],
    },
    {
      name: "update_echelon_apy",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "u64"],
      return: [],
    },
    {
      name: "update_aave_apy",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "u64"],
      return: [],
    },
    {
      name: "set_protocol_active",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "u8", "bool"],
      return: [],
    },
    // View functions
    {
      name: "get_staking_position",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address", "address"],
      return: ["u64", "u64", "u64", "u8", "bool"], // staked_amount, staked_at, unlock_time, protocol, is_active
    },
    {
      name: "get_total_staked",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["u64"],
    },
    {
      name: "get_total_yield_generated",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["u64"],
    },
    {
      name: "get_protocol_stats",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address", "u8"],
      return: ["u64", "u64", "bool"], // apy_bps, total_deposited, is_active
    },
    {
      name: "get_default_protocol",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["u8"],
    },
    {
      name: "get_best_apy",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["u8", "u64"], // protocol, apy_bps
    },
    {
      name: "estimate_current_yield",
      visibility: "public",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["address", "address"],
      return: ["u64"],
    },
    {
      name: "protocol_aave",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [],
      return: ["u8"],
    },
    {
      name: "protocol_echelon",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [],
      return: ["u8"],
    },
  ],
  structs: [],
} as const;

// Echelon Protocol ABI (for direct integration)
export const ECHELON_LENDING_ABI = {
  address: ECHELON_CONTRACT_ADDRESS,
  name: "scripts",
  friends: [],
  exposed_functions: [
    {
      name: "supply",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [{ constraints: [] }],
      params: [
        "&signer",
        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",
        "u64",
      ],
      return: [],
    },
    {
      name: "withdraw",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [{ constraints: [] }],
      params: [
        "&signer",
        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",
        "u64",
      ],
      return: [],
    },
  ],
  structs: [],
} as const;

export const ECHELON_LENDING_ASSETS_ABI = {
  address: ECHELON_CONTRACT_ADDRESS,
  name: "lending",
  friends: [],
  exposed_functions: [
    {
      name: "supply_interest_rate",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [
        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",
      ],
      return: ["0x94f0e00a99685c74067f7541b171bf2a4bd7d859609adce17980a7c924b135c8::fixed_point64::FixedPoint64"],
    },
    {
      name: "account_coins",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [
        "address",
        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",
      ],
      return: ["u64"],
    },
    {
      name: "coins_to_shares",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [
        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",
        "u64",
      ],
      return: ["u64"],
    },
    {
      name: "shares_to_coins",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [
        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",
        "u64",
      ],
      return: ["u64"],
    },
    {
      name: "market_objects",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [],
      return: ["vector<0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>>"],
    },
  ],
  structs: [],
} as const;

// Helper function to convert APY basis points to percentage
export function apyBpsToPercent(bps: number): number {
  return bps / 100;
}

// Helper function to format protocol name
export function getProtocolName(protocol: number): string {
  return PROTOCOL_NAMES[protocol] || "Unknown";
}

// Protocol info interface
export interface ProtocolInfo {
  id: number;
  name: string;
  apyBps: number;
  apyPercent: number;
  totalDeposited: number;
  isActive: boolean;
}

// Staking position interface
export interface StakingPosition {
  poolAddress: string;
  stakedAmount: number;
  stakedAt: number;
  unlockTime: number;
  protocol: number;
  protocolName: string;
  isActive: boolean;
  estimatedYield?: number;
}
