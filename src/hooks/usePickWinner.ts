import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useCallback } from "react";
import { aptosClient } from "@/utils/aptosClient";

// Contract address for the SafeBet manager module
const SAFEBET_ADDRESS =
  process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0xb339b0b5ea892c5e3f24a0a62e22319d17d0ec6f7dff905314c6e5e9755b88ae";

export interface PickWinnerResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export function usePickWinner() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [isPicking, setIsPicking] = useState(false);
  const [lastResult, setLastResult] = useState<PickWinnerResult | null>(null);

  /**
   * Auto-resolve a pool - picks a random winner based on timestamp
   * @param poolAddress The address of the pool to resolve
   */
  const autoResolve = useCallback(
    async (poolAddress: string): Promise<PickWinnerResult> => {
      if (!account?.address) {
        return { success: false, error: "Wallet not connected" };
      }

      setIsPicking(true);
      setLastResult(null);

      try {
        console.log("[usePickWinner] Auto-resolving pool:", poolAddress);
        console.log("[usePickWinner] Config address:", SAFEBET_ADDRESS);

        // Sign and submit transaction
        // auto_resolve(caller: &signer, config_addr: address, pool_address: address)
        const response = await signAndSubmitTransaction({
          data: {
            function: `${SAFEBET_ADDRESS}::manager::auto_resolve`,
            typeArguments: [],
            functionArguments: [SAFEBET_ADDRESS, poolAddress],
          },
        });

        console.log("[usePickWinner] Transaction submitted:", response.hash);

        // Wait for transaction confirmation
        const txnResult = await aptosClient().waitForTransaction({
          transactionHash: response.hash,
        });

        console.log("[usePickWinner] Transaction confirmed:", txnResult);

        const result: PickWinnerResult = {
          success: true,
          hash: response.hash,
        };

        setLastResult(result);
        return result;
      } catch (error: unknown) {
        console.error("[usePickWinner] Error auto-resolving pool:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

        const result: PickWinnerResult = {
          success: false,
          error: errorMessage,
        };

        setLastResult(result);
        return result;
      } finally {
        setIsPicking(false);
      }
    },
    [account, signAndSubmitTransaction],
  );

  /**
   * Lock and stake a pool - prepares it for resolution
   * @param poolAddress The address of the pool to lock
   */
  const lockAndStake = useCallback(
    async (poolAddress: string): Promise<PickWinnerResult> => {
      if (!account?.address) {
        return { success: false, error: "Wallet not connected" };
      }

      setIsPicking(true);
      setLastResult(null);

      try {
        console.log("[usePickWinner] Locking and staking pool:", poolAddress);
        console.log("[usePickWinner] Config address:", SAFEBET_ADDRESS);

        // Sign and submit transaction
        // lock_and_stake(caller: &signer, config_addr: address, pool_address: address)
        const response = await signAndSubmitTransaction({
          data: {
            function: `${SAFEBET_ADDRESS}::manager::lock_and_stake`,
            typeArguments: [],
            functionArguments: [SAFEBET_ADDRESS, poolAddress],
          },
        });

        console.log("[usePickWinner] Transaction submitted:", response.hash);

        // Wait for transaction confirmation
        const txnResult = await aptosClient().waitForTransaction({
          transactionHash: response.hash,
        });

        console.log("[usePickWinner] Transaction confirmed:", txnResult);

        const result: PickWinnerResult = {
          success: true,
          hash: response.hash,
        };

        setLastResult(result);
        return result;
      } catch (error: unknown) {
        console.error("[usePickWinner] Error locking pool:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

        const result: PickWinnerResult = {
          success: false,
          error: errorMessage,
        };

        setLastResult(result);
        return result;
      } finally {
        setIsPicking(false);
      }
    },
    [account, signAndSubmitTransaction],
  );

  /**
   * Resolve and distribute a pool with a specific winning outcome
   * @param poolAddress The address of the pool to resolve
   * @param winningOutcome The winning outcome string
   */
  const resolveAndDistribute = useCallback(
    async (poolAddress: string, winningOutcome: string): Promise<PickWinnerResult> => {
      if (!account?.address) {
        return { success: false, error: "Wallet not connected" };
      }

      setIsPicking(true);
      setLastResult(null);

      try {
        console.log("[usePickWinner] Resolving pool:", poolAddress, "with outcome:", winningOutcome);
        console.log("[usePickWinner] Config address:", SAFEBET_ADDRESS);

        // Sign and submit transaction
        // resolve_and_distribute(caller: &signer, config_addr: address, pool_address: address, winning_outcome: String)
        const response = await signAndSubmitTransaction({
          data: {
            function: `${SAFEBET_ADDRESS}::manager::resolve_and_distribute`,
            typeArguments: [],
            functionArguments: [SAFEBET_ADDRESS, poolAddress, winningOutcome],
          },
        });

        console.log("[usePickWinner] Transaction submitted:", response.hash);

        // Wait for transaction confirmation
        const txnResult = await aptosClient().waitForTransaction({
          transactionHash: response.hash,
        });

        console.log("[usePickWinner] Transaction confirmed:", txnResult);

        const result: PickWinnerResult = {
          success: true,
          hash: response.hash,
        };

        setLastResult(result);
        return result;
      } catch (error: unknown) {
        console.error("[usePickWinner] Error resolving pool:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

        const result: PickWinnerResult = {
          success: false,
          error: errorMessage,
        };

        setLastResult(result);
        return result;
      } finally {
        setIsPicking(false);
      }
    },
    [account, signAndSubmitTransaction],
  );

  return {
    autoResolve,
    lockAndStake,
    resolveAndDistribute,
    isPicking,
    lastResult,
  };
}
