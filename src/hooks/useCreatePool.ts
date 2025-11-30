"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";

// Contract address for the SafeBet pool factory module
const SAFEBET_ADDRESS = "0x37d65db16d842570eb3f6feb83a89537e05f85f1bb2016b6e5a4c7cb64ba5997";

export interface CreatePoolParams {
  name: string;
  outcomes: string[];
  minEntry: number; // In APT (will be converted to octas)
  maxEntry: number; // In APT (will be converted to octas)
}

export interface CreatePoolResult {
  hash: string;
  success: boolean;
  poolAddress?: string;
}

export function useCreatePool() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const createPool = async ({
    name,
    outcomes,
    minEntry,
    maxEntry,
  }: CreatePoolParams): Promise<CreatePoolResult | null> => {
    if (!account) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first",
      });
      return null;
    }

    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Pool name is required",
      });
      return null;
    }

    if (outcomes.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "At least one outcome is required",
      });
      return null;
    }

    if (minEntry <= 0 || maxEntry <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Entry amounts must be greater than 0",
      });
      return null;
    }

    if (minEntry > maxEntry) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Minimum entry cannot be greater than maximum entry",
      });
      return null;
    }

    setIsLoading(true);

    try {
      // Convert APT to octas (1 APT = 10^8 octas)
      const minEntryOctas = Math.floor(minEntry * Math.pow(10, 8));
      const maxEntryOctas = Math.floor(maxEntry * Math.pow(10, 8));

      // Build and submit the transaction
      const response = await signAndSubmitTransaction({
        data: {
          function: `${SAFEBET_ADDRESS}::pool_factory::create_pool`,
          typeArguments: [],
          functionArguments: [
            SAFEBET_ADDRESS, // factory_addr
            name,
            outcomes,
            minEntryOctas.toString(),
            maxEntryOctas.toString(),
          ],
        },
      });

      // Wait for transaction confirmation
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });

      // Check if transaction was successful
      if (executedTransaction.success) {
        // Try to extract the pool address from transaction events
        let poolAddress: string | undefined;

        // Look for the PoolCreated event or similar in the transaction events
        if ("events" in executedTransaction && Array.isArray(executedTransaction.events)) {
          for (const event of executedTransaction.events) {
            // Look for pool creation event that contains the pool address
            if (event.type?.includes("pool") || event.type?.includes("Pool")) {
              // The pool address might be in the event data
              if (event.data?.pool_address) {
                poolAddress = event.data.pool_address;
                break;
              } else if (event.data?.pool) {
                poolAddress = event.data.pool;
                break;
              }
            }
          }
        }

        // If no pool address found in events, try to get it from changes
        if (!poolAddress && "changes" in executedTransaction && Array.isArray(executedTransaction.changes)) {
          for (const change of executedTransaction.changes) {
            // Look for resource changes that might contain the new pool address
            if (change.type === "write_resource") {
              const writeChange = change as { type: string; address?: string; data?: { type?: string } };
              if (writeChange.data?.type?.includes("Pool")) {
                poolAddress = writeChange.address;
                break;
              }
            }
          }
        }

        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ["active-pools"],
        });
        queryClient.invalidateQueries({
          queryKey: ["total-pools"],
        });

        toast({
          title: "Success!",
          description: `Pool "${name}" created successfully on-chain`,
        });

        return {
          hash: response.hash,
          success: true,
          poolAddress,
        };
      } else {
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: "Pool creation transaction failed",
        });
        return null;
      }
    } catch (error: any) {
      console.error("Create pool error:", error);

      let errorMessage = "Failed to create pool. Please try again.";

      // Parse common error messages
      if (error?.message?.includes("E_INVALID_PARAMS")) {
        errorMessage = "Invalid parameters provided";
      } else if (error?.message?.includes("E_ALREADY_INITIALIZED")) {
        errorMessage = "Pool factory already initialized";
      } else if (error?.message?.includes("INSUFFICIENT_BALANCE")) {
        errorMessage = "Insufficient balance for transaction";
      }

      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: errorMessage,
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPool,
    isLoading,
    isConnected: !!account,
  };
}
