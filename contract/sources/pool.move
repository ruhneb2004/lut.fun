/// Pool - Individual lottery pool contract
/// Handles deposits, ticket management, and participant tracking
module safebet::pool {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_std::smart_table::{Self, SmartTable};

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_BETTING_CLOSED: u64 = 2;
    const E_INVALID_AMOUNT: u64 = 3;
    const E_POOL_LOCKED: u64 = 4;
    const E_ALREADY_DEPOSITED: u64 = 5;
    const E_NOT_PARTICIPANT: u64 = 6;

    /// Pool status
    const STATUS_OPEN: u8 = 0;
    const STATUS_LOCKED: u8 = 1;
    const STATUS_RESOLVED: u8 = 2;

    /// Participant entry
    struct Participant has store, drop, copy {
        address: address,
        amount: u64,
        outcome: String,
        ticket_count: u64,
        joined_at: u64,
    }

    /// Pool state
    struct PoolState has key {
        // Pool metadata
        name: String,
        creator: address,
        min_entry: u64,
        max_entry: u64,
        
        // Timing
        betting_deadline: u64,
        resolution_time: u64,
        created_at: u64,
        
        // Status
        status: u8,
        
        // Outcomes
        outcomes: vector<String>,
        outcome_totals: SmartTable<String, u64>,
        
        // Participants
        participants: SmartTable<address, Participant>,
        participant_addresses: vector<address>,
        total_participants: u64,
        
        // Pool balance
        total_pool_amount: u64,
        pool_balance: Coin<AptosCoin>,
        
        // Winner info (after resolution)
        winning_outcome: String,
        winner_addresses: vector<address>,
    }

    /// Events
    #[event]
    struct DepositEvent has drop, store {
        pool_address: address,
        participant: address,
        amount: u64,
        outcome: String,
        timestamp: u64,
    }

    #[event]
    struct PoolLockedEvent has drop, store {
        pool_address: address,
        total_amount: u64,
        total_participants: u64,
        timestamp: u64,
    }

    /// Initialize a new pool
    public fun initialize_pool(
        pool_signer: &signer,
        name: String,
        creator: address,
        min_entry: u64,
        max_entry: u64,
        outcomes: vector<String>,
        betting_duration: u64,
        lock_duration: u64,
    ) {
        let current_time = timestamp::now_seconds();
        
        // Initialize outcome totals
        let outcome_totals = smart_table::new<String, u64>();
        let i = 0;
        let outcomes_len = vector::length(&outcomes);
        while (i < outcomes_len) {
            let outcome = *vector::borrow(&outcomes, i);
            smart_table::add(&mut outcome_totals, outcome, 0);
            i = i + 1;
        };

        move_to(pool_signer, PoolState {
            name,
            creator,
            min_entry,
            max_entry,
            betting_deadline: current_time + betting_duration,
            resolution_time: current_time + betting_duration + lock_duration,
            created_at: current_time,
            status: STATUS_OPEN,
            outcomes,
            outcome_totals,
            participants: smart_table::new(),
            participant_addresses: vector::empty(),
            total_participants: 0,
            total_pool_amount: 0,
            pool_balance: coin::zero<AptosCoin>(),
            winning_outcome: std::string::utf8(b""),
            winner_addresses: vector::empty(),
        });
    }

    /// User deposits/bets on outcome
    public entry fun deposit(
        user: &signer,
        pool_addr: address,
        amount: u64,
        outcome: String,
    ) acquires PoolState {
        let user_addr = signer::address_of(user);
        let pool = borrow_global_mut<PoolState>(pool_addr);
        
        // Validations
        assert!(pool.status == STATUS_OPEN, E_BETTING_CLOSED);
        assert!(timestamp::now_seconds() <= pool.betting_deadline, E_BETTING_CLOSED);
        assert!(amount >= pool.min_entry && amount <= pool.max_entry, E_INVALID_AMOUNT);
        assert!(smart_table::contains(&pool.outcome_totals, outcome), E_INVALID_AMOUNT);
        assert!(!smart_table::contains(&pool.participants, user_addr), E_ALREADY_DEPOSITED);

        // Transfer coins to pool
        let deposit_coins = coin::withdraw<AptosCoin>(user, amount);
        coin::merge(&mut pool.pool_balance, deposit_coins);

        // Calculate tickets (1 ticket = 0.01 APT)
        let ticket_count = amount / 1000000; // 0.01 APT in octas

        // Create participant entry
        let participant = Participant {
            address: user_addr,
            amount,
            outcome,
            ticket_count,
            joined_at: timestamp::now_seconds(),
        };

        // Store participant
        smart_table::add(&mut pool.participants, user_addr, participant);
        vector::push_back(&mut pool.participant_addresses, user_addr);
        pool.total_participants = pool.total_participants + 1;

        // Update outcome totals
        let outcome_total = smart_table::borrow_mut(&mut pool.outcome_totals, outcome);
        *outcome_total = *outcome_total + amount;
        
        pool.total_pool_amount = pool.total_pool_amount + amount;

        // Emit event
        event::emit(DepositEvent {
            pool_address: pool_addr,
            participant: user_addr,
            amount,
            outcome,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Lock pool (called by manager after betting ends)
    public entry fun lock_pool(
        _manager: &signer,
        pool_addr: address,
    ) acquires PoolState {
        let pool = borrow_global_mut<PoolState>(pool_addr);
        
        assert!(pool.status == STATUS_OPEN, E_POOL_LOCKED);
        assert!(timestamp::now_seconds() > pool.betting_deadline, E_BETTING_CLOSED);

        pool.status = STATUS_LOCKED;

        event::emit(PoolLockedEvent {
            pool_address: pool_addr,
            total_amount: pool.total_pool_amount,
            total_participants: pool.total_participants,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Withdraw all funds from the pool (called by manager)
    public fun withdraw_funds(
        _manager: &signer,
        pool_addr: address,
    ): Coin<AptosCoin> acquires PoolState {
        let pool = borrow_global_mut<PoolState>(pool_addr);
        assert!(pool.status == STATUS_LOCKED, E_POOL_LOCKED);
        coin::extract_all(&mut pool.pool_balance)
    }

    /// Receive funds back from prize pool
    public fun receive_from_prize_pool(
        pool_addr: address,
        funds: Coin<AptosCoin>,
    ) acquires PoolState {
        let pool = borrow_global_mut<PoolState>(pool_addr);
        coin::merge(&mut pool.pool_balance, funds);
    }

    /// Set winner (called by manager)
    public entry fun set_winner(
        _manager: &signer,
        pool_addr: address,
        winning_outcome: String,
    ) acquires PoolState {
        let pool = borrow_global_mut<PoolState>(pool_addr);
        
        assert!(pool.status == STATUS_LOCKED, E_NOT_INITIALIZED);
        
        pool.winning_outcome = winning_outcome;
        pool.status = STATUS_RESOLVED;

        // Collect winner addresses
        let i = 0;
        let len = vector::length(&pool.participant_addresses);
        while (i < len) {
            let addr = *vector::borrow(&pool.participant_addresses, i);
            let participant = smart_table::borrow(&pool.participants, addr);
            
            if (participant.outcome == winning_outcome) {
                vector::push_back(&mut pool.winner_addresses, addr);
            };
            
            i = i + 1;
        };
    }

    // ============ View Functions ============

    #[view]
    public fun get_pool_info(pool_addr: address): (
        String, u64, u64, u64, u64, u8, u64
    ) acquires PoolState {
        let pool = borrow_global<PoolState>(pool_addr);
        (
            pool.name,
            pool.min_entry,
            pool.max_entry,
            pool.betting_deadline,
            pool.resolution_time,
            pool.status,
            pool.total_pool_amount
        )
    }

    #[view]
    public fun get_participant_count(pool_addr: address): u64 acquires PoolState {
        let pool = borrow_global<PoolState>(pool_addr);
        pool.total_participants
    }

    #[view]
    public fun get_participant_info(
        pool_addr: address,
        user_addr: address
    ): (u64, String, u64) acquires PoolState {
        let pool = borrow_global<PoolState>(pool_addr);
        
        if (!smart_table::contains(&pool.participants, user_addr)) {
            return (0, std::string::utf8(b""), 0)
        };

        let participant = smart_table::borrow(&pool.participants, user_addr);
        (participant.amount, participant.outcome, participant.ticket_count)
    }

    #[view]
    public fun get_outcome_total(
        pool_addr: address,
        outcome: String
    ): u64 acquires PoolState {
        let pool = borrow_global<PoolState>(pool_addr);
        
        if (!smart_table::contains(&pool.outcome_totals, outcome)) {
            return 0
        };

        *smart_table::borrow(&pool.outcome_totals, outcome)
    }

    #[view]
    public fun get_winner_info(pool_addr: address): (
        String, vector<address>
    ) acquires PoolState {
        let pool = borrow_global<PoolState>(pool_addr);
        (pool.winning_outcome, pool.winner_addresses)
    }

    #[view]
    public fun is_winner(pool_addr: address, user_addr: address): bool acquires PoolState {
        let pool = borrow_global<PoolState>(pool_addr);
        vector::contains(&pool.winner_addresses, &user_addr)
    }
}