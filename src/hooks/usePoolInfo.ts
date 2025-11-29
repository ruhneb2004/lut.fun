"use client";

import { useQuery } from "@tanstack/react-query";
import { aptosClient } from "@/utils/aptosClient";

// Contract address for the SafeBet pool module
const SAFEBET_ADDRESS = "0x45fffbc5d0efd8cacfdbc61af7f64b5198b4ac7b1f7f68c10f1e6b0fc4bdd193";

export interface PoolInfo {
  name: string;
  minEntry: number;
  maxEntry: number;
  createdAt: number;
  lastDrawAt: number;
  status: number;
  totalPoolAmount: number;
}

export interface ParticipantInfo {
  amount: number;
  outcome: string;
  ticketCount: number;
}

// Pool status constants
export const POOL_STATUS = {
  OPEN: 0,
  LOCKED: 1,
  RESOLVED: 2,
} as const;

export function usePoolInfo(poolAddress: string | undefined) {
  return useQuery({
    queryKey: ["pool-info", poolAddress],
    enabled: !!poolAddress,
    refetchInterval: 30_000, // Refresh every 30 seconds
    queryFn: async (): Promise<PoolInfo | null> => {
      if (!poolAddress) return null;

      try {
        const result = await aptosClient().view({
          payload: {
            function: `${SAFEBET_ADDRESS}::pool::get_pool_info`,
            typeArguments: [],
            functionArguments: [poolAddress],
          },
        });

        // Result is [name, min_entry, max_entry, created_at, last_draw_at, status, total_pool_amount]
        return {
          name: result[0] as string,
          minEntry: Number(result[1]),
          maxEntry: Number(result[2]),
          createdAt: Number(result[3]),
          lastDrawAt: Number(result[4]),
          status: Number(result[5]),
          totalPoolAmount: Number(result[6]),
        };
      } catch (error) {
        console.error("Error fetching pool info:", error);
        return null;
      }
    },
  });
}

export function useParticipantInfo(poolAddress: string | undefined, userAddress: string | undefined) {
  return useQuery({
    queryKey: ["participant-info", poolAddress, userAddress],
    enabled: !!poolAddress && !!userAddress,
    refetchInterval: 30_000,
    queryFn: async (): Promise<ParticipantInfo | null> => {
      if (!poolAddress || !userAddress) return null;

      try {
        const result = await aptosClient().view({
          payload: {
            function: `${SAFEBET_ADDRESS}::pool::get_participant_info`,
            typeArguments: [],
            functionArguments: [poolAddress, userAddress],
          },
        });

        // Result is [amount, outcome, ticket_count]
        const amount = Number(result[0]);

        // If amount is 0, user hasn't participated
        if (amount === 0) return null;

        return {
          amount,
          outcome: result[1] as string,
          ticketCount: Number(result[2]),
        };
      } catch (error) {
        console.error("Error fetching participant info:", error);
        return null;
      }
    },
  });
}

export function useParticipantCount(poolAddress: string | undefined) {
  return useQuery({
    queryKey: ["participant-count", poolAddress],
    enabled: !!poolAddress,
    refetchInterval: 30_000,
    queryFn: async (): Promise<number> => {
      if (!poolAddress) return 0;

      try {
        const result = await aptosClient().view({
          payload: {
            function: `${SAFEBET_ADDRESS}::pool::get_participant_count`,
            typeArguments: [],
            functionArguments: [poolAddress],
          },
        });

        return Number(result[0]);
      } catch (error) {
        console.error("Error fetching participant count:", error);
        return 0;
      }
    },
  });
}
