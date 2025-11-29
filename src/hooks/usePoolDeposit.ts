"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Token, toOnChainAmount } from "@/utils/tokens";

// Contract address for the SafeBet pool module
const SAFEBET_ADDRESS = "0x45fffbc5d0efd8cacfdbc61af7f64b5198b4ac7b1f7f68c10f1e6b0fc4bdd193";

export interface DepositParams {
  poolAddress: string;
  amount: number;
  outcome: string;
  token: Token;
}

export function usePoolDeposit() {
  const { account, signAndSubmitTransaction } = useWallet();
  const { client } = useWalletClient();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const deposit = async ({ poolAddress, amount, outcome, token }: DepositParams) => {
    if (!account) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first",
      });
      return null;
    }

    if (amount <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Amount must be greater than 0",
      });
      return null;
    }

    setIsLoading(true);

    try {
      // Convert amount to on-chain format (with decimals)
      const onChainAmount = toOnChainAmount(amount, token.decimals);

      // Build and submit the transaction
      const response = await signAndSubmitTransaction({
        data: {
          function: `${SAFEBET_ADDRESS}::pool::deposit`,
          typeArguments: [],
          functionArguments: [poolAddress, onChainAmount.toString(), outcome],
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

      toast({
        title: "Success!",
        description: `Successfully deposited ${amount} ${token.symbol} to the pool`,
      });

      return executedTransaction;
    } catch (error: any) {
      console.error("Deposit error:", error);

      let errorMessage = "Failed to deposit. Please try again.";

      // Parse common error messages
      if (error?.message?.includes("E_BETTING_CLOSED")) {
        errorMessage = "Betting is closed for this pool";
      } else if (error?.message?.includes("E_INVALID_AMOUNT")) {
        errorMessage = "Invalid amount. Check min/max entry requirements";
      } else if (error?.message?.includes("E_ALREADY_DEPOSITED")) {
        errorMessage = "You have already deposited to this pool";
      } else if (error?.message?.includes("INSUFFICIENT_BALANCE")) {
        errorMessage = "Insufficient balance";
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
    deposit,
    isLoading,
    isConnected: !!account,
  };
}
