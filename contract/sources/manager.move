/// Manager - Orchestrates the entire lottery lifecycle
/// Handles locking, staking, resolution, and prize distribution
module safebet::manager {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::coin;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use safebet::pool;
    use safebet::pool_staking;
    use safebet::prize_pool;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_TOO_EARLY: u64 = 2;
    const E_ALREADY_PROCESSED: u64 = 3;

    /// Manager configuration
    struct ManagerConfig has key {
        admin: address,
        manager_signer_cap: SignerCapability,
        staking_registry_addr: address,
        prize_pool_registry_addr: address,
        automation_enabled: bool,
    }

    /// Events
    #[event]
    struct PoolLockedAndStakedEvent has drop, store {
        pool_address: address,
        amount_staked: u64,
        timestamp: u64,
    }

    #[event]
    struct PoolResolvedEvent has drop, store {
        pool_address: address,
        winning_outcome: String,
        yield_earned: u64,
        timestamp: u64,
    }

    /// Initialize manager
    fun init_module(deployer: &signer) {
        let deployer_addr = signer::address_of(deployer);
        
        // Create resource account for manager operations
        let (_, manager_signer_cap) = account::create_resource_account(
            deployer,
            b"SAFEBET_MANAGER_V1"
        );

        move_to(deployer, ManagerConfig {
            admin: deployer_addr,
            manager_signer_cap,
            staking_registry_addr: @safebet, // Will be set after deployment
            prize_pool_registry_addr: @safebet, // Will be set after deployment
            automation_enabled: true,
        });
    }

    /// Lock pool and stake to Aave (called after betting period ends)
    public entry fun lock_and_stake(
        caller: &signer,
        config_addr: address,
        pool_address: address,
    ) acquires ManagerConfig {
        let config = borrow_global_mut<ManagerConfig>(config_addr);
        
        // Get manager signer
        let manager_signer = account::create_signer_with_capability(&config.manager_signer_cap);

        // 1. Lock the pool
        pool::lock_pool(&manager_signer, pool_address);

        // 2. Get pool info to determine stake amount and unlock time
        let (_, _, _, _, resolution_time, _, total_amount) = 
            pool::get_pool_info(pool_address);

        // 3. Withdraw funds from the pool
        let pool_funds = pool::withdraw_funds(&manager_signer, pool_address);

        // 4. Stake funds
        pool_staking::stake_to_aave(
            &manager_signer,
            config.staking_registry_addr,
            pool_address,
            pool_funds,
            resolution_time
        );

        event::emit(PoolLockedAndStakedEvent {
            pool_address,
            amount_staked: total_amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Resolve pool and distribute prizes (called after resolution time)
    public entry fun resolve_and_distribute(
        caller: &signer,
        config_addr: address,
        pool_address: address,
        winning_outcome: String,
    ) acquires ManagerConfig {
        let config = borrow_global_mut<ManagerConfig>(config_addr);
        
        // Get manager signer
        let manager_signer = account::create_signer_with_capability(&config.manager_signer_cap);

        // 1. Get pool info
        let (_, _, _, _, resolution_time, _, _) = 
            pool::get_pool_info(pool_address);
        
        assert!(timestamp::now_seconds() >= resolution_time, E_TOO_EARLY);

        // 2. Unstake from Aave
        let (principal_coin, yield_earned) = pool_staking::unstake_from_aave(
            &manager_signer,
            config.staking_registry_addr,
            pool_address
        );
        let principal_amount = coin::value(&principal_coin);

        // 3. Set winner in pool
        pool::set_winner(&manager_signer, pool_address, winning_outcome);

        // 4. Get winner/loser counts
        let (winning_outcome_final, winner_addresses) = pool::get_winner_info(pool_address);
        let winner_count = vector::length(&winner_addresses);
        let total_participants = pool::get_participant_count(pool_address);
        let loser_count = total_participants - winner_count;

        // 5. Deposit funds to prize pool
        prize_pool::deposit_prize_funds(
            config.prize_pool_registry_addr,
            principal_coin
        );

        // 6. Setup prize distribution
        prize_pool::setup_distribution(
            &manager_signer,
            config.prize_pool_registry_addr,
            pool_address,
            principal_amount,
            yield_earned,
            winner_count,
            loser_count
        );

        event::emit(PoolResolvedEvent {
            pool_address,
            winning_outcome,
            yield_earned,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Pick random winner (simplified - in production use VRF)
    public fun pick_random_winner(
        outcomes: vector<String>,
        seed: u64,
    ): String {
        let outcomes_len = vector::length(&outcomes);
        let random_index = seed % outcomes_len;
        *vector::borrow(&outcomes, random_index)
    }

    /// Auto-resolve with random winner
    public entry fun auto_resolve(
        caller: &signer,
        config_addr: address,
        pool_address: address,
    ) acquires ManagerConfig {
        let config = borrow_global<ManagerConfig>(config_addr);
        
        // Get pool outcomes
        let (_, _, _, _, _, _, _) = 
            pool::get_pool_info(pool_address);

        // Simple random: use timestamp as seed
        let seed = timestamp::now_seconds();
        
        // Get all outcomes from pool (this would need a view function in pool contract)
        // For now, assume we have outcomes
        let outcomes = vector::empty<String>();
        vector::push_back(&mut outcomes, std::string::utf8(b"Outcome A"));
        vector::push_back(&mut outcomes, std::string::utf8(b"Outcome B"));
        
        let winning_outcome = pick_random_winner(outcomes, seed);

        resolve_and_distribute(caller, config_addr, pool_address, winning_outcome);
    }

    // ============ Admin Functions ============

    public entry fun set_staking_registry(
        admin: &signer,
        config_addr: address,
        staking_registry_addr: address,
    ) acquires ManagerConfig {
        let config = borrow_global_mut<ManagerConfig>(config_addr);
        assert!(signer::address_of(admin) == config.admin, E_NOT_AUTHORIZED);
        config.staking_registry_addr = staking_registry_addr;
    }

    public entry fun set_prize_pool_registry(
        admin: &signer,
        config_addr: address,
        prize_pool_registry_addr: address,
    ) acquires ManagerConfig {
        let config = borrow_global_mut<ManagerConfig>(config_addr);
        assert!(signer::address_of(admin) == config.admin, E_NOT_AUTHORIZED);
        config.prize_pool_registry_addr = prize_pool_registry_addr;
    }

    // ============ View Functions ============

    #[view]
    public fun is_automation_enabled(config_addr: address): bool acquires ManagerConfig {
        let config = borrow_global<ManagerConfig>(config_addr);
        config.automation_enabled
    }
}
