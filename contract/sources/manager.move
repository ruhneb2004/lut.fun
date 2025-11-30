/// Manager - Orchestrates the entire lottery lifecycle
/// Handles locking, staking, resolution, and prize distribution
module safebet::manager {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use safebet::pool;

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
    struct PoolResolvedEvent has drop, store {
        pool_address: address,
        winning_outcome: String,
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
            staking_registry_addr: @safebet,
            prize_pool_registry_addr: @safebet,
            automation_enabled: true,
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

    /// Auto-resolve with random winner - SIMPLIFIED VERSION WITHOUT STAKING
    /// This version directly picks a winner without locking/staking
    public entry fun auto_resolve(
        _caller: &signer,
        config_addr: address,
        pool_address: address,
    ) acquires ManagerConfig {
        let config = borrow_global<ManagerConfig>(config_addr);
        
        // Get manager signer
        let manager_signer = account::create_signer_with_capability(&config.manager_signer_cap);

        // Simple random: use timestamp as seed
        let seed = timestamp::now_seconds();
        
        // Define outcomes
        let outcomes = vector::empty<String>();
        vector::push_back(&mut outcomes, std::string::utf8(b"Outcome A"));
        vector::push_back(&mut outcomes, std::string::utf8(b"Outcome B"));
        
        let winning_outcome = pick_random_winner(outcomes, seed);

        // Lock the pool first
        pool::lock_pool(&manager_signer, pool_address);

        // Set winner directly (no staking involved)
        pool::set_winner(&manager_signer, pool_address, winning_outcome);

        event::emit(PoolResolvedEvent {
            pool_address,
            winning_outcome,
            timestamp: timestamp::now_seconds(),
        });
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
