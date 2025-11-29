"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrGetUser,
  getUserDetails,
  updateUserName,
  getLotteryHistory,
  addLotteryHistory,
  updateActiveTickets,
} from "@/lib/database";
import type { LotteryHistoryInsert } from "@/types/supabase";

/**
 * Hook to manage user database operations
 * Automatically creates/fetches user when wallet connects
 */
export function useUserDatabase() {
  const { account, connected } = useWallet();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const userAddress = account?.address?.toString();

  // Create or get user when wallet connects
  useEffect(() => {
    const initUser = async () => {
      if (connected && userAddress && !isInitialized) {
        await createOrGetUser(userAddress);
        setIsInitialized(true);
        // Invalidate queries to refetch with new user
        queryClient.invalidateQueries({ queryKey: ["user-details", userAddress] });
        queryClient.invalidateQueries({ queryKey: ["lottery-history", userAddress] });
      }
    };

    initUser();
  }, [connected, userAddress, isInitialized, queryClient]);

  // Reset initialization state when wallet disconnects
  useEffect(() => {
    if (!connected) {
      setIsInitialized(false);
    }
  }, [connected]);

  // Query for user details
  const {
    data: userDetails,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user-details", userAddress],
    queryFn: () => getUserDetails(userAddress!),
    enabled: !!userAddress && connected,
    staleTime: 30000, // 30 seconds
  });

  // Query for lottery history
  const {
    data: lotteryHistory,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["lottery-history", userAddress],
    queryFn: () => getLotteryHistory(userAddress!),
    enabled: !!userAddress && connected,
    staleTime: 30000,
  });

  // Mutation to update user name
  const updateNameMutation = useMutation({
    mutationFn: (name: string) => updateUserName(userAddress!, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-details", userAddress] });
    },
  });

  // Mutation to add lottery history
  const addHistoryMutation = useMutation({
    mutationFn: (entry: Omit<LotteryHistoryInsert, "user_address">) =>
      addLotteryHistory({ ...entry, user_address: userAddress! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lottery-history", userAddress] });
    },
  });

  // Mutation to update active tickets
  const updateTicketsMutation = useMutation({
    mutationFn: (count: number) => updateActiveTickets(userAddress!, count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-details", userAddress] });
    },
  });

  return {
    // User data
    userDetails,
    isLoadingUser,
    userError,
    refetchUser,

    // Lottery history
    lotteryHistory: lotteryHistory || [],
    isLoadingHistory,
    historyError,
    refetchHistory,

    // Mutations
    updateName: updateNameMutation.mutate,
    isUpdatingName: updateNameMutation.isPending,

    addLotteryEntry: addHistoryMutation.mutate,
    isAddingHistory: addHistoryMutation.isPending,

    updateActiveTickets: updateTicketsMutation.mutate,
    isUpdatingTickets: updateTicketsMutation.isPending,

    // State
    isConnected: connected,
    isInitialized,
    userAddress,
  };
}
