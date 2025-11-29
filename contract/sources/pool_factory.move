/// PoolFactory - Creates and manages lottery pools
/// Inspired by PoolTogether's architecture
module safebet::pool_factory {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::event;
    use aptos_std::bcs;
    use aptos_std::table::{Self, Table};
    use safebet::pool;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_POOL_NOT_FOUND: u64 = 2;
    const E_INVALID_PARAMS: u64 = 3;
    const E_ALREADY_INITIALIZED: u64 = 4;

    /// Pool metadata structure
    struct PoolMetadata has store, copy, drop {
        pool_address: address,
        creator: address,
        name: String,
        min_entry: u64,
        max_entry: u64,
        created_at: u64,
        is_active: bool,
    }

    /// Global factory registry
    struct PoolFactoryRegistry has key {
        pools: Table<address, PoolMetadata>,
        pool_addresses: vector<address>,
        active_pools: vector<address>,
        total_pools_created: u64,
        // Resource account for creating pools
        pool_creator_cap: SignerCapability,
    }

    /// Events
    #[event]
    struct PoolCreatedEvent has drop, store {
        pool_address: address,
        creator: address,
        name: String,
        min_entry: u64,
        max_entry: u64,
        timestamp: u64,
    }

    #[event]
    struct PoolDeactivatedEvent has drop, store {
        pool_address: address,
        timestamp: u64,
    }

    /// Initialize the factory (called once at deployment)
    fun init_module(deployer: &signer) {
        // Create resource account for pool creation
        let (_, pool_creator_cap) = account::create_resource_account(
            deployer,
            b"SAFEBET_POOL_CREATOR_V1"
        );

        move_to(deployer, PoolFactoryRegistry {
            pools: table::new(),
            pool_addresses: vector::empty(),
            active_pools: vector::empty(),
            total_pools_created: 0,
            pool_creator_cap,
        });
    }

    /// Create a new lottery pool
    public entry fun create_pool(
        creator: &signer,
        factory_addr: address,
        name: String,
        outcomes: vector<String>,
        min_entry: u64,
        max_entry: u64,
    ) acquires PoolFactoryRegistry {
        // Validation
        assert!(min_entry > 0, E_INVALID_PARAMS);
        assert!(max_entry >= min_entry, E_INVALID_PARAMS);

        let creator_addr = signer::address_of(creator);
        let factory = borrow_global_mut<PoolFactoryRegistry>(factory_addr);

        // Generate unique pool address using creator + pool count
        let pool_seed = vector::empty<u8>();
        vector::append(&mut pool_seed, b"POOL_");
        let pool_count_bytes = bcs::to_bytes(&factory.total_pools_created);
        vector::append(&mut pool_seed, pool_count_bytes);

        // Create pool resource account
        let pool_signer = account::create_signer_with_capability(&factory.pool_creator_cap);
        let (pool_resource_signer, _) = account::create_resource_account(
            &pool_signer,
            pool_seed
        );
        let pool_address = signer::address_of(&pool_resource_signer);

        // Initialize the actual pool contract
        pool::initialize_pool(
            &pool_resource_signer,
            name,
            creator_addr,
            min_entry,
            max_entry,
            outcomes,
        );

        // Create pool metadata
        let metadata = PoolMetadata {
            pool_address,
            creator: creator_addr,
            name,
            min_entry,
            max_entry,
            created_at: aptos_framework::timestamp::now_seconds(),
            is_active: true,
        };

        // Register pool
        table::add(&mut factory.pools, pool_address, metadata);
        vector::push_back(&mut factory.pool_addresses, pool_address);
        vector::push_back(&mut factory.active_pools, pool_address);
        factory.total_pools_created = factory.total_pools_created + 1;
        
        // Emit event
        event::emit(PoolCreatedEvent {
            pool_address,
            creator: creator_addr,
            name,
            min_entry,
            max_entry,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// Deactivate a pool (when resolved)
    public entry fun deactivate_pool(
        pool_address: address,
        factory_addr: address,
    ) acquires PoolFactoryRegistry {
        let factory = borrow_global_mut<PoolFactoryRegistry>(factory_addr);
        
        assert!(table::contains(&factory.pools, pool_address), E_POOL_NOT_FOUND);
        
        let metadata = table::borrow_mut(&mut factory.pools, pool_address);
        metadata.is_active = false;

        // Remove from active pools
        let (found, index) = vector::index_of(&factory.active_pools, &pool_address);
        if (found) {
            vector::remove(&mut factory.active_pools, index);
        };

        event::emit(PoolDeactivatedEvent {
            pool_address,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    // ============ View Functions ============

    #[view]
    public fun get_total_pools(factory_addr: address): u64 acquires PoolFactoryRegistry {
        let factory = borrow_global<PoolFactoryRegistry>(factory_addr);
        factory.total_pools_created
    }

    #[view]
    public fun get_active_pools(factory_addr: address): vector<address> acquires PoolFactoryRegistry {
        let factory = borrow_global<PoolFactoryRegistry>(factory_addr);
        factory.active_pools
    }

    #[view]
    public fun get_all_pools(factory_addr: address): vector<address> acquires PoolFactoryRegistry {
        let factory = borrow_global<PoolFactoryRegistry>(factory_addr);
        factory.pool_addresses
    }

    #[view]
    public fun get_pool_metadata(
        factory_addr: address,
        pool_address: address
    ): (address, String, u64, u64, bool) acquires PoolFactoryRegistry {
        let factory = borrow_global<PoolFactoryRegistry>(factory_addr);
        let metadata = table::borrow(&factory.pools, pool_address);
        
        (
            metadata.creator,
            metadata.name,
            metadata.min_entry,
            metadata.max_entry,
            metadata.is_active
        )
    }
}