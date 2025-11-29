import { supabase } from "./supabase";
import type { 
  UserDetails, UserDetailsInsert, UserDetailsUpdate, 
  LotteryHistory, LotteryHistoryInsert,
  PoolCreate, PoolCreateInsert, PoolCreateUpdate,
  ChartData, ChartDataInsert,
  TopHolder, TopHolderInsert
} from "@/types/supabase";

// ======================== User Details Functions ========================

/**
 * Check if a user exists by wallet address
 */
export async function checkUserExists(address: string): Promise<boolean> {
  console.log("[DB] Checking if user exists:", address);
  const { data, error } = await supabase
    .from("user_details")
    .select("address")
    .eq("address", address)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("[DB] Error checking user:", error);
  }

  console.log("[DB] User exists:", !!data);
  return !!data;
}

/**
 * Create a new user or return existing user
 * This is called when a wallet connects
 */
export async function createOrGetUser(address: string, name?: string): Promise<UserDetails | null> {
  console.log("[DB] createOrGetUser called with address:", address);
  
  // First check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("user_details")
    .select("*")
    .eq("address", address)
    .single();

  console.log("[DB] Fetch result:", { existingUser, fetchError });

  // If user exists, return them
  if (existingUser) {
    console.log("[DB] User already exists, returning:", existingUser);
    return existingUser;
  }

  // If no user found (PGRST116), create new user
  if (fetchError?.code === "PGRST116") {
    console.log("[DB] User not found, creating new user...");
    
    const newUser: UserDetailsInsert = {
      address,
      name: name || null,
    };

    console.log("[DB] Inserting new user:", newUser);

    const { data: createdUser, error: insertError } = await supabase
      .from("user_details")
      .insert([newUser])
      .select()
      .single();

    if (insertError) {
      console.error("[DB] Error creating user:", insertError);
      console.error("[DB] Error details:", JSON.stringify(insertError, null, 2));
      return null;
    }

    console.log("[DB] Successfully created user:", createdUser);
    return createdUser;
  }

  if (fetchError) {
    console.error("[DB] Error fetching user:", fetchError);
    console.error("[DB] Error details:", JSON.stringify(fetchError, null, 2));
  }

  return null;
}

/**
 * Get user details by wallet address
 */
export async function getUserDetails(address: string): Promise<UserDetails | null> {
  const { data, error } = await supabase
    .from("user_details")
    .select("*")
    .eq("address", address)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Error fetching user details:", error);
    }
    return null;
  }

  return data;
}

/**
 * Update user details
 */
export async function updateUserDetails(
  address: string,
  updates: UserDetailsUpdate
): Promise<UserDetails | null> {
  const { data, error } = await supabase
    .from("user_details")
    .update(updates)
    .eq("address", address)
    .select()
    .single();

  if (error) {
    console.error("Error updating user details:", error);
    return null;
  }

  return data;
}

/**
 * Update user name
 */
export async function updateUserName(address: string, name: string): Promise<UserDetails | null> {
  return updateUserDetails(address, { name });
}

/**
 * Increment games played and update stats
 */
export async function incrementGamesPlayed(
  address: string,
  won: boolean,
  winAmount?: number
): Promise<UserDetails | null> {
  // Get current user stats
  const user = await getUserDetails(address);
  if (!user) return null;

  const newGamesPlayed = (user.game_played || 0) + 1;
  const newTotalWin = won ? (user.total_win || 0) + (winAmount || 0) : user.total_win || 0;
  const winsCount = won ? Math.round(((user.win_rate || 0) / 100) * (user.game_played || 0)) + 1 
                        : Math.round(((user.win_rate || 0) / 100) * (user.game_played || 0));
  const newWinRate = newGamesPlayed > 0 ? (winsCount / newGamesPlayed) * 100 : 0;

  return updateUserDetails(address, {
    game_played: newGamesPlayed,
    total_win: newTotalWin,
    win_rate: parseFloat(newWinRate.toFixed(2)),
  });
}

/**
 * Update active tickets count
 */
export async function updateActiveTickets(address: string, count: number): Promise<UserDetails | null> {
  return updateUserDetails(address, { active_tickets: count });
}

// ======================== Lottery History Functions ========================

/**
 * Get lottery history for a user
 */
export async function getLotteryHistory(userAddress: string): Promise<LotteryHistory[]> {
  const { data, error } = await supabase
    .from("lottery_history")
    .select("*")
    .eq("user_address", userAddress)
    .order("played_at", { ascending: false });

  if (error) {
    console.error("Error fetching lottery history:", error);
    return [];
  }

  return data || [];
}

/**
 * Add a new lottery history entry
 */
export async function addLotteryHistory(entry: LotteryHistoryInsert): Promise<LotteryHistory | null> {
  const { data, error } = await supabase
    .from("lottery_history")
    .insert([entry])
    .select()
    .single();

  if (error) {
    console.error("Error adding lottery history:", error);
    return null;
  }

  return data;
}

/**
 * Update lottery history status (e.g., when lottery ends)
 */
export async function updateLotteryHistoryStatus(
  userAddress: string,
  lotteryName: string,
  status: string
): Promise<LotteryHistory | null> {
  const { data, error } = await supabase
    .from("lottery_history")
    .update({ status })
    .eq("user_address", userAddress)
    .eq("lottery_name", lotteryName)
    .select()
    .single();

  if (error) {
    console.error("Error updating lottery history:", error);
    return null;
  }

  return data;
}

/**
 * Get active lotteries for a user
 */
export async function getActiveLotteries(userAddress: string): Promise<LotteryHistory[]> {
  const { data, error } = await supabase
    .from("lottery_history")
    .select("*")
    .eq("user_address", userAddress)
    .eq("status", "Active")
    .order("played_at", { ascending: false });

  if (error) {
    console.error("Error fetching active lotteries:", error);
    return [];
  }

  return data || [];
}

// ======================== Pool Create Functions ========================

/**
 * Create a new pool
 */
export async function createPool(pool: PoolCreateInsert): Promise<PoolCreate | null> {
  console.log("[DB] Creating new pool:", pool);
  
  const { data, error } = await supabase
    .from("pool_create")
    .insert([pool])
    .select()
    .single();

  if (error) {
    console.error("[DB] Error creating pool:", error);
    console.error("[DB] Error details:", JSON.stringify(error, null, 2));
    return null;
  }

  console.log("[DB] Successfully created pool:", data);
  return data;
}

/**
 * Get a pool by ID
 */
export async function getPoolById(poolId: string): Promise<PoolCreate | null> {
  const { data, error } = await supabase
    .from("pool_create")
    .select("*")
    .eq("id", poolId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[DB] Error fetching pool:", error);
    }
    return null;
  }

  return data;
}

/**
 * Get a pool by name
 */
export async function getPoolByName(name: string): Promise<PoolCreate | null> {
  const { data, error } = await supabase
    .from("pool_create")
    .select("*")
    .eq("name", name)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[DB] Error fetching pool by name:", error);
    }
    return null;
  }

  return data;
}

/**
 * Get all pools
 */
export async function getAllPools(): Promise<PoolCreate[]> {
  const { data, error } = await supabase
    .from("pool_create")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[DB] Error fetching all pools:", error);
    return [];
  }

  return data || [];
}

/**
 * Update pool details
 */
export async function updatePool(poolId: string, updates: PoolCreateUpdate): Promise<PoolCreate | null> {
  const { data, error } = await supabase
    .from("pool_create")
    .update(updates)
    .eq("id", poolId)
    .select()
    .single();

  if (error) {
    console.error("[DB] Error updating pool:", error);
    return null;
  }

  return data;
}

/**
 * Update pool total (after buy/sell)
 */
export async function updatePoolTotal(poolId: string, newTotal: number): Promise<PoolCreate | null> {
  return updatePool(poolId, { total: newTotal });
}

// ======================== Chart Data Functions ========================

/**
 * Add chart data entry (for buy/sell actions)
 */
export async function addChartData(entry: ChartDataInsert): Promise<ChartData | null> {
  console.log("[DB] Adding chart data:", entry);
  
  const { data, error } = await supabase
    .from("chart_data")
    .insert([entry])
    .select()
    .single();

  if (error) {
    console.error("[DB] Error adding chart data:", error);
    console.error("[DB] Error details:", JSON.stringify(error, null, 2));
    return null;
  }

  console.log("[DB] Successfully added chart data:", data);
  return data;
}

/**
 * Get chart data for a pool
 */
export async function getChartData(poolId: string): Promise<ChartData[]> {
  const { data, error } = await supabase
    .from("chart_data")
    .select("*")
    .eq("pool_id", poolId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[DB] Error fetching chart data:", error);
    return [];
  }

  return data || [];
}

/**
 * Get recent chart data for a pool (limited)
 */
export async function getRecentChartData(poolId: string, limit: number = 100): Promise<ChartData[]> {
  const { data, error } = await supabase
    .from("chart_data")
    .select("*")
    .eq("pool_id", poolId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[DB] Error fetching recent chart data:", error);
    return [];
  }

  // Return in ascending order for chart display
  return (data || []).reverse();
}

// ======================== Top Holders Functions ========================

/**
 * Upsert (insert or update) a top holder entry
 * This should be called when a user buys or sells tickets
 */
export async function upsertTopHolder(entry: TopHolderInsert): Promise<TopHolder | null> {
  console.log("[DB] Upserting top holder:", entry);
  
  // Check if holder already exists for this pool
  const { data: existingHolder } = await supabase
    .from("top_holders")
    .select("*")
    .eq("pool_id", entry.pool_id!)
    .eq("address", entry.address)
    .single();

  if (existingHolder) {
    // Update existing holder
    const { data, error } = await supabase
      .from("top_holders")
      .update({
        ticket_count: entry.ticket_count,
        updated_at: new Date().toISOString()
      })
      .eq("id", existingHolder.id)
      .select()
      .single();

    if (error) {
      console.error("[DB] Error updating top holder:", error);
      return null;
    }

    console.log("[DB] Successfully updated top holder:", data);
    return data;
  } else {
    // Insert new holder
    const { data, error } = await supabase
      .from("top_holders")
      .insert([{
        ...entry,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error("[DB] Error inserting top holder:", error);
      console.error("[DB] Error details:", JSON.stringify(error, null, 2));
      return null;
    }

    console.log("[DB] Successfully inserted top holder:", data);
    return data;
  }
}

/**
 * Get top holders for a pool (sorted by ticket count descending)
 */
export async function getTopHolders(poolId: string, limit: number = 10): Promise<TopHolder[]> {
  const { data, error } = await supabase
    .from("top_holders")
    .select("*")
    .eq("pool_id", poolId)
    .order("ticket_count", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[DB] Error fetching top holders:", error);
    return [];
  }

  return data || [];
}

/**
 * Get holder info for a specific address in a pool
 */
export async function getHolderByAddress(poolId: string, address: string): Promise<TopHolder | null> {
  const { data, error } = await supabase
    .from("top_holders")
    .select("*")
    .eq("pool_id", poolId)
    .eq("address", address)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[DB] Error fetching holder:", error);
    }
    return null;
  }

  return data;
}

/**
 * Update holder ticket count (add or subtract)
 */
export async function updateHolderTicketCount(
  poolId: string, 
  address: string, 
  ticketChange: number
): Promise<TopHolder | null> {
  // Get current holder info
  const holder = await getHolderByAddress(poolId, address);
  
  if (holder) {
    const newCount = holder.ticket_count + ticketChange;
    
    // If new count is 0 or less, remove the holder
    if (newCount <= 0) {
      await supabase
        .from("top_holders")
        .delete()
        .eq("id", holder.id);
      return null;
    }
    
    return upsertTopHolder({
      pool_id: poolId,
      address,
      ticket_count: newCount
    });
  } else if (ticketChange > 0) {
    // New holder
    return upsertTopHolder({
      pool_id: poolId,
      address,
      ticket_count: ticketChange
    });
  }
  
  return null;
}

/**
 * Delete a holder (when they sell all tickets)
 */
export async function deleteHolder(poolId: string, address: string): Promise<boolean> {
  const { error } = await supabase
    .from("top_holders")
    .delete()
    .eq("pool_id", poolId)
    .eq("address", address);

  if (error) {
    console.error("[DB] Error deleting holder:", error);
    return false;
  }

  return true;
}
