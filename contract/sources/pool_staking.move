/// PoolStaking - Manages staking pool funds to Aave for yield generation
module safebet::pool_staking {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_POOL_NOT_STAKED: u64 = 2;
    const E_ALREADY_STAKED: u64 = 3;
    const E_TOO_EARLY: u64 = 4;

    /// Staking position for a pool
    struct StakingPosition has store {
        pool_address: address,
        staked_amount: u64,
        staked_at: u64,
        unlock_time: u64,
        aave_position_id: u64, // Reference to Aave position
        is_active: bool,
    }

    /// Global staking registry
    struct StakingRegistry has key {
        positions: Table<address, StakingPosition>,
        total_staked: u64,
        total_yield_generated: u64,
    }

    /// Events
    #[event]
    struct StakedEvent has drop, store {
        pool_address: address,
        amount: u64,
        unlock_time: u64,
        timestamp: u64,
    }

    #[event]
    struct UnstakedEvent has drop, store {
        pool_address: address,
        principal: u64,
        yield_earned: u64,
        timestamp: u64,
    }

    /// Initialize staking registry
    fun init_module(deployer: &signer) {
        move_to(deployer, StakingRegistry {
            positions: table::new(),
            total_staked: 0,
            total_yield_generated: 0,
        });
    }

    /// Stake pool funds to Aave
    public entry fun stake_to_aave(
        manager: &signer,
        registry_addr: address,
        pool_address: address,
        amount: u64,
        unlock_time: u64,
    ) acquires StakingRegistry {
        let registry = borrow_global_mut<StakingRegistry>(registry_addr);
        
        assert!(!table::contains(&registry.positions, pool_address), E_ALREADY_STAKED);

        // In production, deposit to Aave here:
        // let aave_position_id = aave::pool::supply<AptosCoin>(manager, funds);
        
        // For hackathon: simulate Aave position
        let aave_position_id = amount; // Mock ID

        // Create staking position
        let position = StakingPosition {
            pool_address,
            staked_amount: amount,
            staked_at: timestamp::now_seconds(),
            unlock_time,
            aave_position_id,
            is_active: true,
        };

        table::add(&mut registry.positions, pool_address, position);
        registry.total_staked = registry.total_staked + amount;

        event::emit(StakedEvent {
            pool_address,
            amount,
            unlock_time,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Unstake from Aave and calculate yield
    public fun unstake_from_aave(
        manager: &signer,
        registry_addr: address,
        pool_address: address,
    ): (u64, u64) acquires StakingRegistry {
        let registry = borrow_global_mut<StakingRegistry>(registry_addr);
        
        assert!(table::contains(&registry.positions, pool_address), E_POOL_NOT_STAKED);
        
        let position = table::borrow_mut(&mut registry.positions, pool_address);
        
        assert!(position.is_active, E_POOL_NOT_STAKED);
        assert!(timestamp::now_seconds() >= position.unlock_time, E_TOO_EARLY);

        let principal = position.staked_amount;
        
        // In production, withdraw from Aave:
        // let (principal_returned, yield_earned) = aave::pool::withdraw<AptosCoin>(
        //     manager,
        //     position.aave_position_id
        // );
        
        // For hackathon: simulate 10% APY yield
        let time_staked = timestamp::now_seconds() - position.staked_at;
        let years_staked = (time_staked as u128) * 1000000 / (365 * 24 * 60 * 60 * 1000000); // Fixed point
        let yield_earned = ((principal as u128) * 10 * years_staked / 100) as u64; // 10% APY

        position.is_active = false;
        registry.total_yield_generated = registry.total_yield_generated + yield_earned;

        event::emit(UnstakedEvent {
            pool_address,
            principal,
            yield_earned,
            timestamp: timestamp::now_seconds(),
        });

        (principal, yield_earned)
    }

    /// Get current yield estimate
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
        let years_staked = (time_staked as u128) * 1000000 / (365 * 24 * 60 * 60 * 1000000);
        let yield_estimate = ((position.staked_amount as u128) * 10 * years_staked / 100) as u64;

        yield_estimate
    }

    // ============ View Functions ============

    #[view]
    public fun get_staking_position(
        registry_addr: address,
        pool_address: address
    ): (u64, u64, u64, bool) acquires StakingRegistry {
        let registry = borrow_global<StakingRegistry>(registry_addr);
        
        if (!table::contains(&registry.positions, pool_address)) {
            return (0, 0, 0, false)
        };

        let position = table::borrow(&registry.positions, pool_address);
        (
            position.staked_amount,
            position.staked_at,
            position.unlock_time,
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
}