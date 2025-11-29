import { supabase } from "./supabase";
import type { UserDetails, UserDetailsInsert, UserDetailsUpdate, LotteryHistory, LotteryHistoryInsert } from "@/types/supabase";

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
