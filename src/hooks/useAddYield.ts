import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useCallback } from "react";
import { aptosClient } from "@/utils/aptosClient";

// Contract address for the SafeBet pool module
const SAFEBET_ADDRESS =
  process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0xb339b0b5ea892c5e3f24a0a62e22319d17d0ec6f7dff905314c6e5e9755b88ae";

export interface AddYieldResult {
  success: boolean;
  hash?: string;
  newTotal?: number;
  error?: string;
}

export function useAddYield() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [isAddingYield, setIsAddingYield] = useState(false);
  const [lastResult, setLastResult] = useState<AddYieldResult | null>(null);

  /**
   * Add yield to a pool
   * @param poolAddress The address of the pool
   * @param amountInApt The amount in APT to add as yield
   */
  const addYield = useCallback(
    async (poolAddress: string, amountInApt: number): Promise<AddYieldResult> => {
      if (!account?.address) {
        return { success: false, error: "Wallet not connected" };
      }

      if (amountInApt <= 0) {
        return { success: false, error: "Amount must be greater than 0" };
      }

      setIsAddingYield(true);
      setLastResult(null);

      try {
        // Convert APT to octas (1 APT = 100_000_000 octas)
        const amountInOctas = Math.floor(amountInApt * 100_000_000);

        console.log("[useAddYield] Adding yield to pool:", {
          poolAddress,
          amountInApt,
          amountInOctas,
        });

        // Sign and submit transaction
        const response = await signAndSubmitTransaction({
          data: {
            function: `${SAFEBET_ADDRESS}::pool::add_yield`,
            typeArguments: [],
            functionArguments: [poolAddress, amountInOctas.toString()],
          },
        });

        console.log("[useAddYield] Transaction submitted:", response.hash);

        // Wait for transaction confirmation
        const txnResult = await aptosClient().waitForTransaction({
          transactionHash: response.hash,
        });

        console.log("[useAddYield] Transaction confirmed:", txnResult);

        const result: AddYieldResult = {
          success: true,
          hash: response.hash,
        };

        setLastResult(result);
        return result;
      } catch (error: unknown) {
        console.error("[useAddYield] Error adding yield:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

        const result: AddYieldResult = {
          success: false,
          error: errorMessage,
        };

        setLastResult(result);
        return result;
      } finally {
        setIsAddingYield(false);
      }
    },
    [account, signAndSubmitTransaction],
  );

  return {
    addYield,
    isAddingYield,
    lastResult,
  };
}
