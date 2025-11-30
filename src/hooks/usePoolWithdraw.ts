"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";

// Contract address for the SafeBet pool module
const SAFEBET_ADDRESS =
  process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0x37d65db16d842570eb3f6feb83a89537e05f85f1bb2016b6e5a4c7cb64ba5997";

export interface WithdrawParams {
  poolAddress: string;
}

export function usePoolWithdraw() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const withdraw = async ({ poolAddress }: WithdrawParams) => {
    if (!account) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first",
      });
      return null;
    }

    setIsLoading(true);

    try {
      // Build and submit the transaction
      const response = await signAndSubmitTransaction({
        data: {
          function: `${SAFEBET_ADDRESS}::pool::withdraw`,
          typeArguments: [],
          functionArguments: [poolAddress],
        },
      });

      // Wait for transaction confirmation
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["pool-info", poolAddress],
      });
      queryClient.invalidateQueries({
        queryKey: ["apt-balance", account.address],
      });
      queryClient.invalidateQueries({
        queryKey: ["participant-info", poolAddress, account.address],
      });

      toast({
        title: "Success!",
        description: "Successfully withdrew your deposit from the pool",
      });

      return executedTransaction;
    } catch (error: any) {
      console.error("Withdraw error:", error);

      let errorMessage = "Failed to withdraw. Please try again.";

      // Parse common error messages
      if (error?.message?.includes("E_POOL_LOCKED") || error?.message?.includes("0x4")) {
        errorMessage = "Pool is locked. Cannot withdraw after draw has started.";
      } else if (error?.message?.includes("E_NOT_PARTICIPANT") || error?.message?.includes("0x6")) {
        errorMessage = "You are not a participant in this pool";
      } else if (error?.message?.includes("INSUFFICIENT_BALANCE")) {
        errorMessage = "Insufficient pool balance";
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
    withdraw,
    isLoading,
    isConnected: !!account,
  };
}
