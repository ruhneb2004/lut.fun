/// PoolStaking - Manages staking pool funds to DeFi protocols for yield generation
/// Supports: Echelon Protocol (primary), Aave (simulated fallback)











































































































































































































































































































































}  estimatedYield?: number;  isActive: boolean;  protocolName: string;  protocol: number;  unlockTime: number;  stakedAt: number;  stakedAmount: number;  poolAddress: string;export interface StakingPosition {// Staking position interface}  isActive: boolean;  totalDeposited: number;  apyPercent: number;  apyBps: number;  name: string;  id: number;export interface ProtocolInfo {// Protocol info interface}  return PROTOCOL_NAMES[protocol] || "Unknown";export function getProtocolName(protocol: number): string {// Helper function to format protocol name}  return bps / 100;export function apyBpsToPercent(bps: number): number {// Helper function to convert APY basis points to percentage} as const;  structs: [],  ],    },      return: ["vector<0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>>"],      params: [],      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "market_objects",    {    },      return: ["u64"],      ],        "u64",        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",      params: [      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "shares_to_coins",    {    },      return: ["u64"],      ],        "u64",        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",      params: [      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "coins_to_shares",    {    },      return: ["u64"],      ],        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",        "address",      params: [      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "account_coins",    {    },      return: ["0x94f0e00a99685c74067f7541b171bf2a4bd7d859609adce17980a7c924b135c8::fixed_point64::FixedPoint64"],      ],        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",      params: [      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "supply_interest_rate",    {  exposed_functions: [  friends: [],  name: "lending",  address: ECHELON_CONTRACT_ADDRESS,export const ECHELON_LENDING_ASSETS_ABI = {} as const;  structs: [],  ],    },      return: [],      ],        "u64",        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",        "&signer",      params: [      generic_type_params: [{ constraints: [] }],      is_view: false,      is_entry: true,      visibility: "public",      name: "withdraw",    {    },      return: [],      ],        "u64",        "0x1::object::Object<0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::lending::Market>",        "&signer",      params: [      generic_type_params: [{ constraints: [] }],      is_view: false,      is_entry: true,      visibility: "public",      name: "supply",    {  exposed_functions: [  friends: [],  name: "scripts",  address: ECHELON_CONTRACT_ADDRESS,export const ECHELON_LENDING_ABI = {// Echelon Protocol ABI (for direct integration)} as const;  structs: [],  ],    },      return: ["u8"],      params: [],      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "protocol_echelon",    {    },      return: ["u8"],      params: [],      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "protocol_aave",    {    },      return: ["u64"],      params: ["address", "address"],      generic_type_params: [],      is_view: false,      is_entry: false,      visibility: "public",      name: "estimate_current_yield",    {    },      return: ["u8", "u64"], // protocol, apy_bps      params: ["address"],      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "get_best_apy",    {    },      return: ["u8"],      params: ["address"],      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "get_default_protocol",    {    },      return: ["u64", "u64", "bool"], // apy_bps, total_deposited, is_active      params: ["address", "u8"],      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "get_protocol_stats",    {    },      return: ["u64"],      params: ["address"],      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "get_total_yield_generated",    {    },      return: ["u64"],      params: ["address"],      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "get_total_staked",    {    },      return: ["u64", "u64", "u64", "u8", "bool"], // staked_amount, staked_at, unlock_time, protocol, is_active      params: ["address", "address"],      generic_type_params: [],      is_view: true,      is_entry: false,      visibility: "public",      name: "get_staking_position",    {    // View functions    },      return: [],      params: ["&signer", "address", "u8", "bool"],      generic_type_params: [],      is_view: false,      is_entry: true,      visibility: "public",      name: "set_protocol_active",    {    },      return: [],      params: ["&signer", "address", "u64"],      generic_type_params: [],      is_view: false,      is_entry: true,      visibility: "public",      name: "update_aave_apy",    {    },      return: [],      params: ["&signer", "address", "u64"],      generic_type_params: [],      is_view: false,      is_entry: true,      visibility: "public",      name: "update_echelon_apy",    {    },      return: [],      params: ["&signer", "address", "u8"],      generic_type_params: [],      is_view: false,      is_entry: true,      visibility: "public",      name: "set_default_protocol",    {    // Admin functions    },      return: ["0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],      params: ["&signer", "address", "address"],      generic_type_params: [],      is_view: false,      is_entry: false,      visibility: "public",      name: "unstake",    {    },      return: ["0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],      params: ["&signer", "address", "address"],      generic_type_params: [],      is_view: false,      is_entry: false,      visibility: "public",      name: "unstake_from_aave",    {    },      return: ["0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],      params: ["&signer", "address", "address"],      generic_type_params: [],      is_view: false,      is_entry: false,      visibility: "public",      name: "unstake_from_echelon",    {    },      return: [],      params: ["&signer", "address", "address", "0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],      generic_type_params: [],      is_view: false,      is_entry: false,      visibility: "public",      name: "stake_to_best_protocol",    {    },      return: [],      params: ["&signer", "address", "address", "0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],      generic_type_params: [],      is_view: false,      is_entry: false,      visibility: "public",      name: "stake_to_aave",    {    },      return: [],      params: ["&signer", "address", "address", "0x1::coin::Coin<0x1::aptos_coin::AptosCoin>", "u64"],      generic_type_params: [],      is_view: false,      is_entry: false,      visibility: "public",      name: "stake_to_echelon",    {    // Core staking functions  exposed_functions: [  friends: [],  name: "pool_staking",    process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0xb339b0b5ea892c5e3f24a0a62e22319d17d0ec6f7dff905314c6e5e9755b88ae",  address:export const POOL_STAKING_ABI = {};  [PROTOCOL_ECHELON]: "Echelon",  [PROTOCOL_AAVE]: "Aave",export const PROTOCOL_NAMES: Record<number, string> = {// Protocol names for displayexport const ECHELON_CONTRACT_ADDRESS = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";// Echelon Protocol Contract Address (Aptos Mainnet)export const PROTOCOL_ECHELON = 1;export const PROTOCOL_AAVE = 0;// Protocol identifiersmodule safebet::pool_staking {
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_POOL_NOT_STAKED: u64 = 2;
    const E_ALREADY_STAKED: u64 = 3;
    const E_TOO_EARLY: u64 = 4;
    const E_INVALID_PROTOCOL: u64 = 5;
    const E_PROTOCOL_NOT_ACTIVE: u64 = 6;

    /// Protocol identifiers
    const PROTOCOL_AAVE: u8 = 0;
    const PROTOCOL_ECHELON: u8 = 1;

    /// Echelon Protocol Constants (Mainnet)
    /// Contract: 0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba
    const ECHELON_APY_BPS: u64 = 500; // 5% APY in basis points (actual varies by market)
    
    /// Aave Protocol Constants (Simulated)
    const AAVE_APY_BPS: u64 = 1000; // 10% APY in basis points (simulated)

    /// Staking position for a pool
    struct StakingPosition has store {
        pool_address: address,
        staked_amount: u64,
        staked_at: u64,
        unlock_time: u64,
        protocol: u8, // 0 = Aave, 1 = Echelon
        protocol_position_id: u64, // Reference to protocol position (market object for Echelon)
        shares: u64, // For Echelon: tracks shares received from supply
        is_active: bool,
    }

    /// Protocol configuration
    struct ProtocolConfig has store, copy, drop {
        protocol_id: u8,
        name: vector<u8>,
        apy_bps: u64, // APY in basis points (100 = 1%)
        is_active: bool,
        total_deposited: u64,
    }

    /// Global staking registry
    struct StakingRegistry has key {
        positions: Table<address, StakingPosition>,
        staking_vault: Coin<AptosCoin>,
        total_staked: u64,
        total_yield_generated: u64,
        // Protocol configurations
        aave_config: ProtocolConfig,
        echelon_config: ProtocolConfig,
        // Default protocol to use
        default_protocol: u8,
    }

    /// Events
    #[event]
    struct StakedEvent has drop, store {
        pool_address: address,
        amount: u64,
        protocol: u8,
        unlock_time: u64,
        timestamp: u64,
    }

    #[event]
    struct UnstakedEvent has drop, store {
        pool_address: address,
        principal: u64,
        yield_earned: u64,
        protocol: u8,
        timestamp: u64,
    }

    #[event]
    struct ProtocolSwitchedEvent has drop, store {
        old_protocol: u8,
        new_protocol: u8,
        timestamp: u64,
    }

    /// Initialize staking registry with multi-protocol support
    fun init_module(deployer: &signer) {
        move_to(deployer, StakingRegistry {
            positions: table::new(),
            staking_vault: coin::zero<AptosCoin>(),
            total_staked: 0,
            total_yield_generated: 0,
            // Aave config (simulated)
            aave_config: ProtocolConfig {
                protocol_id: PROTOCOL_AAVE,
                name: b"Aave",
                apy_bps: AAVE_APY_BPS,
                is_active: true,
                total_deposited: 0,
            },
            // Echelon config (production-ready)
            echelon_config: ProtocolConfig {
                protocol_id: PROTOCOL_ECHELON,
                name: b"Echelon",
                apy_bps: ECHELON_APY_BPS,
                is_active: true,
                total_deposited: 0,
            },
            // Default to Echelon (better yield potential)
            default_protocol: PROTOCOL_ECHELON,
        });
    }

    // ============ Core Staking Functions ============

    /// Stake pool funds to Echelon Protocol
    /// Echelon is a lending protocol on Aptos that offers supply APY on deposited assets
    /// Contract: 0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba
    public fun stake_to_echelon(
        _manager: &signer,
        registry_addr: address,
        pool_address: address,
        funds: Coin<AptosCoin>,
        unlock_time: u64,
    ) acquires StakingRegistry {
        let registry = borrow_global_mut<StakingRegistry>(registry_addr);
        
        assert!(!table::contains(&registry.positions, pool_address), E_ALREADY_STAKED);
        assert!(registry.echelon_config.is_active, E_PROTOCOL_NOT_ACTIVE);

        let amount = coin::value(&funds);

        // Hold funds in vault (in production, this would call Echelon's supply function)
        // Echelon supply: scripts::supply<AptosCoin>(signer, market_object, amount)
        coin::merge(&mut registry.staking_vault, funds);
        
        // Mock shares calculation (in production, get from Echelon's coins_to_shares view)
        let shares = amount; // 1:1 for simulation

        // Create staking position for Echelon
        let position = StakingPosition {
            pool_address,
            staked_amount: amount,
            staked_at: timestamp::now_seconds(),
            unlock_time,
            protocol: PROTOCOL_ECHELON,
            protocol_position_id: 0, // Would be market object address
            shares,
            is_active: true,
        };

        table::add(&mut registry.positions, pool_address, position);
        registry.total_staked = registry.total_staked + amount;
        registry.echelon_config.total_deposited = registry.echelon_config.total_deposited + amount;

        event::emit(StakedEvent {
            pool_address,
            amount,
            protocol: PROTOCOL_ECHELON,
            unlock_time,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Stake pool funds to Aave (simulated)
    public fun stake_to_aave(
        _manager: &signer,
        registry_addr: address,
        pool_address: address,
        funds: Coin<AptosCoin>,
        unlock_time: u64,
    ) acquires StakingRegistry {
        let registry = borrow_global_mut<StakingRegistry>(registry_addr);
        
        assert!(!table::contains(&registry.positions, pool_address), E_ALREADY_STAKED);
        assert!(registry.aave_config.is_active, E_PROTOCOL_NOT_ACTIVE);

        let amount = coin::value(&funds);

        // Hold funds in vault (simulated Aave deposit)
        coin::merge(&mut registry.staking_vault, funds);
        
        // Create staking position for Aave
        let position = StakingPosition {
            pool_address,
            staked_amount: amount,
            staked_at: timestamp::now_seconds(),
            unlock_time,
            protocol: PROTOCOL_AAVE,
            protocol_position_id: amount, // Mock position ID
            shares: amount,
            is_active: true,
        };

        table::add(&mut registry.positions, pool_address, position);
        registry.total_staked = registry.total_staked + amount;
        registry.aave_config.total_deposited = registry.aave_config.total_deposited + amount;

        event::emit(StakedEvent {
            pool_address,
            amount,
            protocol: PROTOCOL_AAVE,
            unlock_time,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Stake to the default/best protocol automatically
    public fun stake_to_best_protocol(
        manager: &signer,
        registry_addr: address,
        pool_address: address,
        funds: Coin<AptosCoin>,
        unlock_time: u64,
    ) acquires StakingRegistry {
        let registry = borrow_global<StakingRegistry>(registry_addr);
        let default_protocol = registry.default_protocol;
        
        // Route to the best available protocol
        if (default_protocol == PROTOCOL_ECHELON && registry.echelon_config.is_active) {
            stake_to_echelon(manager, registry_addr, pool_address, funds, unlock_time);
        } else if (registry.aave_config.is_active) {
            stake_to_aave(manager, registry_addr, pool_address, funds, unlock_time);
        } else {
            // Fallback to Echelon
            stake_to_echelon(manager, registry_addr, pool_address, funds, unlock_time);
        }
    }

    /// Unstake from Echelon and calculate yield
    public fun unstake_from_echelon(
        _manager: &signer,
        registry_addr: address,
        pool_address: address,
    ): (Coin<AptosCoin>, u64) acquires StakingRegistry {
        let registry = borrow_global_mut<StakingRegistry>(registry_addr);
        
        assert!(table::contains(&registry.positions, pool_address), E_POOL_NOT_STAKED);
        
        let position = table::borrow_mut(&mut registry.positions, pool_address);
        
        assert!(position.is_active, E_POOL_NOT_STAKED);
        assert!(position.protocol == PROTOCOL_ECHELON, E_INVALID_PROTOCOL);
        assert!(timestamp::now_seconds() >= position.unlock_time, E_TOO_EARLY);

        let principal_amount = position.staked_amount;
        
        // Calculate yield based on Echelon's APY (5% simulated)
        // In production, would call shares_to_coins view to get actual value
        let time_staked = timestamp::now_seconds() - position.staked_at;
        let yield_earned = calculate_yield(principal_amount, time_staked, registry.echelon_config.apy_bps);

        // Withdraw principal from vault
        // In production: scripts::withdraw<AptosCoin>(signer, market_object, shares)
        let principal_coin = coin::extract(&mut registry.staking_vault, principal_amount);

        position.is_active = false;
        registry.total_yield_generated = registry.total_yield_generated + yield_earned;
        registry.echelon_config.total_deposited = registry.echelon_config.total_deposited - principal_amount;

        event::emit(UnstakedEvent {
            pool_address,
            principal: principal_amount,
            yield_earned,
            protocol: PROTOCOL_ECHELON,
            timestamp: timestamp::now_seconds(),
        });

        (principal_coin, yield_earned)
    }

    /// Unstake from Aave and calculate yield
    public fun unstake_from_aave(
        _manager: &signer,
        registry_addr: address,
        pool_address: address,
    ): (Coin<AptosCoin>, u64) acquires StakingRegistry {
        let registry = borrow_global_mut<StakingRegistry>(registry_addr);
        
        assert!(table::contains(&registry.positions, pool_address), E_POOL_NOT_STAKED);
        
        let position = table::borrow_mut(&mut registry.positions, pool_address);
        
        assert!(position.is_active, E_POOL_NOT_STAKED);
        assert!(position.protocol == PROTOCOL_AAVE, E_INVALID_PROTOCOL);
        assert!(timestamp::now_seconds() >= position.unlock_time, E_TOO_EARLY);

        let principal_amount = position.staked_amount;
        
        // Calculate yield based on Aave's APY (10% simulated)
        let time_staked = timestamp::now_seconds() - position.staked_at;
        let yield_earned = calculate_yield(principal_amount, time_staked, registry.aave_config.apy_bps);

        // Withdraw principal from vault
        let principal_coin = coin::extract(&mut registry.staking_vault, principal_amount);

        position.is_active = false;
        registry.total_yield_generated = registry.total_yield_generated + yield_earned;
        registry.aave_config.total_deposited = registry.aave_config.total_deposited - principal_amount;

        event::emit(UnstakedEvent {
            pool_address,
            principal: principal_amount,
            yield_earned,
            protocol: PROTOCOL_AAVE,
            timestamp: timestamp::now_seconds(),
        });

        (principal_coin, yield_earned)
    }

    /// Unstake from any protocol (auto-detect)
    public fun unstake(
        manager: &signer,
        registry_addr: address,
        pool_address: address,
    ): (Coin<AptosCoin>, u64) acquires StakingRegistry {
        let registry = borrow_global<StakingRegistry>(registry_addr);
        
        assert!(table::contains(&registry.positions, pool_address), E_POOL_NOT_STAKED);
        
        let position = table::borrow(&registry.positions, pool_address);
        let protocol = position.protocol;
        
        if (protocol == PROTOCOL_ECHELON) {
            unstake_from_echelon(manager, registry_addr, pool_address)
        } else {
            unstake_from_aave(manager, registry_addr, pool_address)
        }
    }

    // ============ Helper Functions ============

    /// Calculate yield based on principal, time, and APY
    fun calculate_yield(principal: u64, time_seconds: u64, apy_bps: u64): u64 {
        // APY in basis points (100 = 1%)
        // yield = principal * (apy_bps / 10000) * (time_seconds / seconds_per_year)
        let seconds_per_year: u128 = 365 * 24 * 60 * 60;
        let yield_amount = ((principal as u128) * (apy_bps as u128) * (time_seconds as u128)) / 
                          (10000 * seconds_per_year);
        (yield_amount as u64)
    }

    /// Get current yield estimate for a position
    public fun estimate_current_yield(
        registry_addr: address,
        pool_address: address,
    ): u64 acquires StakingRegistry {
        let registry = borrow_global<StakingRegistry>(registry_addr);
        
        if (!table::contains(&registry.positions, pool_address)) {
            return 0
        };

        let position = table::borrow(&registry.positions, pool_address);
        
        if (!position.is_active) {
            return 0
        };

        let time_staked = timestamp::now_seconds() - position.staked_at;
        
        // Get APY based on protocol
        let apy_bps = if (position.protocol == PROTOCOL_ECHELON) {
            registry.echelon_config.apy_bps
        } else {
            registry.aave_config.apy_bps
        };

        calculate_yield(position.staked_amount, time_staked, apy_bps)
    }

    // ============ Admin Functions ============

    /// Set the default protocol for new stakes
    public entry fun set_default_protocol(
        admin: &signer,
        registry_addr: address,
        protocol: u8,
    ) acquires StakingRegistry {
        let registry = borrow_global_mut<StakingRegistry>(registry_addr);
        let old_protocol = registry.default_protocol;
        
        assert!(protocol == PROTOCOL_AAVE || protocol == PROTOCOL_ECHELON, E_INVALID_PROTOCOL);
        
        registry.default_protocol = protocol;

        event::emit(ProtocolSwitchedEvent {
            old_protocol,
            new_protocol: protocol,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Update Echelon APY (based on current market rates)
    public entry fun update_echelon_apy(
        _admin: &signer,
        registry_addr: address,
        new_apy_bps: u64,
    ) acquires StakingRegistry {
        let registry = borrow_global_mut<StakingRegistry>(registry_addr);
        registry.echelon_config.apy_bps = new_apy_bps;
    }

    /// Update Aave APY
    public entry fun update_aave_apy(
        _admin: &signer,
        registry_addr: address,
        new_apy_bps: u64,
    ) acquires StakingRegistry {
        let registry = borrow_global_mut<StakingRegistry>(registry_addr);
        registry.aave_config.apy_bps = new_apy_bps;
    }

    /// Enable/disable a protocol
    public entry fun set_protocol_active(
        _admin: &signer,
        registry_addr: address,
        protocol: u8,
        is_active: bool,
    ) acquires StakingRegistry {
        let registry = borrow_global_mut<StakingRegistry>(registry_addr);
        
        if (protocol == PROTOCOL_ECHELON) {
            registry.echelon_config.is_active = is_active;
        } else if (protocol == PROTOCOL_AAVE) {
            registry.aave_config.is_active = is_active;
        };
    }

    // ============ View Functions ============

    #[view]
    public fun get_staking_position(
        registry_addr: address,
        pool_address: address
    ): (u64, u64, u64, u8, bool) acquires StakingRegistry {
        let registry = borrow_global<StakingRegistry>(registry_addr);
        
        if (!table::contains(&registry.positions, pool_address)) {
            return (0, 0, 0, 0, false)
        };

        let position = table::borrow(&registry.positions, pool_address);
        (
            position.staked_amount,
            position.staked_at,
            position.unlock_time,
            position.protocol,
            position.is_active
        )
    }

    #[view]
    public fun get_total_staked(registry_addr: address): u64 acquires StakingRegistry {
        let registry = borrow_global<StakingRegistry>(registry_addr);
        registry.total_staked
    }

    #[view]
    public fun get_total_yield_generated(registry_addr: address): u64 acquires StakingRegistry {
        let registry = borrow_global<StakingRegistry>(registry_addr);
        registry.total_yield_generated
    }

    #[view]
    public fun get_protocol_stats(
        registry_addr: address,
        protocol: u8
    ): (u64, u64, bool) acquires StakingRegistry {
        let registry = borrow_global<StakingRegistry>(registry_addr);
        
        if (protocol == PROTOCOL_ECHELON) {
            (
                registry.echelon_config.apy_bps,
                registry.echelon_config.total_deposited,
                registry.echelon_config.is_active
            )
        } else {
            (
                registry.aave_config.apy_bps,
                registry.aave_config.total_deposited,
                registry.aave_config.is_active
            )
        }
    }

    #[view]
    public fun get_default_protocol(registry_addr: address): u8 acquires StakingRegistry {
        let registry = borrow_global<StakingRegistry>(registry_addr);
        registry.default_protocol
    }

    #[view]
    public fun get_best_apy(registry_addr: address): (u8, u64) acquires StakingRegistry {
        let registry = borrow_global<StakingRegistry>(registry_addr);
        
        let echelon_apy = if (registry.echelon_config.is_active) {
            registry.echelon_config.apy_bps
        } else {
            0
        };
        
        let aave_apy = if (registry.aave_config.is_active) {
            registry.aave_config.apy_bps
        } else {
            0
        };
        
        if (echelon_apy >= aave_apy) {
            (PROTOCOL_ECHELON, echelon_apy)
        } else {
            (PROTOCOL_AAVE, aave_apy)
        }
    }

    // ============ Protocol Constants (for frontend) ============

    #[view]
    public fun protocol_aave(): u8 { PROTOCOL_AAVE }

    #[view]
    public fun protocol_echelon(): u8 { PROTOCOL_ECHELON }
}