/// PrizePool - Manages prize distribution to winners and principal returns to losers
module safebet::prize_pool {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_std::smart_table::{Self, SmartTable};
    use safebet::pool;
    use aptos_std::table::{Self, Table};

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_ALREADY_CLAIMED: u64 = 2;
    const E_NOT_CLAIMABLE: u64 = 3;
    const E_POOL_NOT_FOUND: u64 = 4;

    /// Prize distribution for a pool
    struct PrizeDistribution has store {
        pool_address: address,
        total_principal: u64,
        total_yield: u64,
        winner_count: u64,
        loser_count: u64,
        yield_per_winner: u64,
        is_distributed: bool,
    }

    /// Claim status tracking
    struct ClaimRecord has store {
        user_address: address,
        amount_claimed: u64,
        claimed_at: u64,
        is_winner: bool,
    }

    /// Global prize pool registry
    struct PrizePoolRegistry has key {
        distributions: Table<address, PrizeDistribution>,
        claims: SmartTable<address, SmartTable<address, ClaimRecord>>, // pool -> user -> claim
        prize_vault: Coin<AptosCoin>,
        total_prizes_distributed: u64,
    }

    /// Events
    #[event]
    struct PrizeDistributedEvent has drop, store {
        pool_address: address,
        total_yield: u64,
        winner_count: u64,
        yield_per_winner: u64,
        timestamp: u64,
    }

    #[event]
    struct PrizeClaimedEvent has drop, store {
        pool_address: address,
        user: address,
        amount: u64,
        is_winner: bool,
        timestamp: u64,
    }

    /// Initialize prize pool
    fun init_module(deployer: &signer) {
        move_to(deployer, PrizePoolRegistry {
            distributions: table::new(),
            claims: smart_table::new(),
            prize_vault: coin::zero<AptosCoin>(),
            total_prizes_distributed: 0,
        });
    }

    /// Receive yield from staking and setup distribution
    public entry fun setup_distribution(
        manager: &signer,
        registry_addr: address,
        pool_address: address,
        principal_amount: u64,
        yield_amount: u64,
        winner_count: u64,
        loser_count: u64,
    ) acquires PrizePoolRegistry {
        let registry = borrow_global_mut<PrizePoolRegistry>(registry_addr);
        
        assert!(!table::contains(&registry.distributions, pool_address), E_NOT_AUTHORIZED);

        // Calculate yield per winner
        let yield_per_winner = if (winner_count > 0) {
            yield_amount / winner_count
        } else {
            0
        };

        let distribution = PrizeDistribution {
            pool_address,
            total_principal: principal_amount,
            total_yield: yield_amount,
            winner_count,
            loser_count,
            yield_per_winner,
            is_distributed: false,
        };

        table::add(&mut registry.distributions, pool_address, distribution);

        event::emit(PrizeDistributedEvent {
            pool_address,
            total_yield: yield_amount,
            winner_count,
            yield_per_winner,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// Deposit funds to prize pool
    public fun deposit_prize_funds(
        registry_addr: address,
        funds: Coin<AptosCoin>,
    ) acquires PrizePoolRegistry {
        let registry = borrow_global_mut<PrizePoolRegistry>(registry_addr);
        coin::merge(&mut registry.prize_vault, funds);
    }

    /// User claims their reward (winner gets yield + principal, loser gets principal)
    public entry fun claim_prize(
        user: &signer,
        registry_addr: address,
        pool_address: address,
    ) acquires PrizePoolRegistry {
        let user_addr = signer::address_of(user);
        let registry = borrow_global_mut<PrizePoolRegistry>(registry_addr);
        
        assert!(table::contains(&registry.distributions, pool_address), E_POOL_NOT_FOUND);

        // Check if already claimed
        if (smart_table::contains(&registry.claims, pool_address)) {
            let pool_claims = smart_table::borrow(&registry.claims, pool_address);
            assert!(!smart_table::contains(pool_claims, user_addr), E_ALREADY_CLAIMED);
        };

        let distribution = table::borrow(&registry.distributions, pool_address);

        // Securely fetch user data from the pool contract
        let (user_principal, _, _) = pool::get_participant_info(pool_address, user_addr);
        let is_winner = pool::is_winner(pool_address, user_addr);

        // Calculate claim amount
        let claim_amount = if (is_winner) {
            user_principal + distribution.yield_per_winner
        } else {
            user_principal
        };

        // Transfer prize
        let prize_coins = coin::extract(&mut registry.prize_vault, claim_amount);
        coin::deposit(user_addr, prize_coins);

        // Record claim
        let claim_record = ClaimRecord {
            user_address: user_addr,
            amount_claimed: claim_amount,
            claimed_at: aptos_framework::timestamp::now_seconds(),
            is_winner,
        };

        // Initialize pool claims if needed
        if (!smart_table::contains(&registry.claims, pool_address)) {
            smart_table::add(&mut registry.claims, pool_address, smart_table::new());
        };

        let pool_claims = smart_table::borrow_mut(&mut registry.claims, pool_address);
        smart_table::add(pool_claims, user_addr, claim_record);

        registry.total_prizes_distributed = registry.total_prizes_distributed + claim_amount;

        event::emit(PrizeClaimedEvent {
            pool_address,
            user: user_addr,
            amount: claim_amount,
            is_winner,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    // ============ View Functions ============

    #[view]
    public fun get_distribution_info(
        registry_addr: address,
        pool_address: address
    ): (u64, u64, u64, u64, u64) acquires PrizePoolRegistry {
        let registry = borrow_global<PrizePoolRegistry>(registry_addr);
        
        if (!table::contains(&registry.distributions, pool_address)) {
            return (0, 0, 0, 0, 0)
        };

        let distribution = table::borrow(&registry.distributions, pool_address);
        (
            distribution.total_principal,
            distribution.total_yield,
            distribution.winner_count,
            distribution.loser_count,
            distribution.yield_per_winner
        )
    }

    #[view]
    public fun has_claimed(
        registry_addr: address,
        pool_address: address,
        user_addr: address
    ): bool acquires PrizePoolRegistry {
        let registry = borrow_global<PrizePoolRegistry>(registry_addr);
        
        if (!smart_table::contains(&registry.claims, pool_address)) {
            return false
        };

        let pool_claims = smart_table::borrow(&registry.claims, pool_address);
        smart_table::contains(pool_claims, user_addr)
    }

    #[view]
    public fun get_claim_info(
        registry_addr: address,
        pool_address: address,
        user_addr: address
    ): (u64, bool) acquires PrizePoolRegistry {
        let registry = borrow_global<PrizePoolRegistry>(registry_addr);
        
        if (!smart_table::contains(&registry.claims, pool_address)) {
            return (0, false)
        };

        let pool_claims = smart_table::borrow(&registry.claims, pool_address);
        
        if (!smart_table::contains(pool_claims, user_addr)) {
            return (0, false)
        };

        let claim = smart_table::borrow(pool_claims, user_addr);
        (claim.amount_claimed, claim.is_winner)
    }

    #[view]
    public fun get_total_prizes_distributed(registry_addr: address): u64 acquires PrizePoolRegistry {
        let registry = borrow_global<PrizePoolRegistry>(registry_addr);
        registry.total_prizes_distributed
    }

    #[view]
    public fun get_vault_balance(registry_addr: address): u64 acquires PrizePoolRegistry {
        let registry = borrow_global<PrizePoolRegistry>(registry_addr);
        coin::value(&registry.prize_vault)
    }
}