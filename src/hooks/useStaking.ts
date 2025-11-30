"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useCallback } from "react";
import { aptosClient } from "@/utils/aptosClient";
import {
  PROTOCOL_AAVE,
  PROTOCOL_ECHELON,
  getProtocolName,
  apyBpsToPercent,
  type ProtocolInfo,
  type StakingPosition,
} from "@/utils/staking_abi";

// Contract address for the SafeBet staking module
const SAFEBET_ADDRESS =
  process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0xb339b0b5ea892c5e3f24a0a62e22319d17d0ec6f7dff905314c6e5e9755b88ae";

export interface StakingResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export function useStaking() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [isStaking, setIsStaking] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isUnstaking, _setIsUnstaking] = useState(false);
  const [lastResult, setLastResult] = useState<StakingResult | null>(null);

  /**
   * Get the staking position for a pool
   */
  const getStakingPosition = useCallback(
    async (poolAddress: string): Promise<StakingPosition | null> => {
      try {
        const result = await aptosClient().view({
          payload: {
            function: `${SAFEBET_ADDRESS}::pool_staking::get_staking_position`,
            typeArguments: [],
            functionArguments: [SAFEBET_ADDRESS, poolAddress],
          },
        });

        const [stakedAmount, stakedAt, unlockTime, protocol, isActive] = result as [
          string,
          string,
          string,
          number,
          boolean
        ];

        if (!isActive && Number(stakedAmount) === 0) {
          return null;
        }

        return {
          poolAddress,
          stakedAmount: Number(stakedAmount),
          stakedAt: Number(stakedAt),
          unlockTime: Number(unlockTime),
          protocol: Number(protocol),
          protocolName: getProtocolName(Number(protocol)),
          isActive,
        };
      } catch (error) {
        console.error("[useStaking] Error getting staking position:", error);
        return null;
      }
    },
    []
  );

  /**
   * Get protocol stats (APY, total deposited, active status)
   */
  const getProtocolStats = useCallback(
    async (protocol: number): Promise<ProtocolInfo | null> => {
      try {
        const result = await aptosClient().view({
          payload: {
            function: `${SAFEBET_ADDRESS}::pool_staking::get_protocol_stats`,
            typeArguments: [],
            functionArguments: [SAFEBET_ADDRESS, protocol],
          },
        });

        const [apyBps, totalDeposited, isActive] = result as [string, string, boolean];

        return {
          id: protocol,
          name: getProtocolName(protocol),
          apyBps: Number(apyBps),
          apyPercent: apyBpsToPercent(Number(apyBps)),
          totalDeposited: Number(totalDeposited),
          isActive,
        };
      } catch (error) {
        console.error("[useStaking] Error getting protocol stats:", error);
        return null;
      }
    },
    []
  );

  /**
   * Get the best APY protocol
   */
  const getBestApy = useCallback(async (): Promise<{ protocol: number; apyBps: number } | null> => {
    try {
      const result = await aptosClient().view({
        payload: {
          function: `${SAFEBET_ADDRESS}::pool_staking::get_best_apy`,
          typeArguments: [],
          functionArguments: [SAFEBET_ADDRESS],
        },
      });

      const [protocol, apyBps] = result as [number, string];

      return {
        protocol: Number(protocol),
        apyBps: Number(apyBps),
      };
    } catch (error) {
      console.error("[useStaking] Error getting best APY:", error);
      return null;
    }
  }, []);

  /**
   * Get all protocol info
   */
  const getAllProtocolInfo = useCallback(async (): Promise<ProtocolInfo[]> => {
    const protocols: ProtocolInfo[] = [];

    const aaveInfo = await getProtocolStats(PROTOCOL_AAVE);
    if (aaveInfo) protocols.push(aaveInfo);

    const echelonInfo = await getProtocolStats(PROTOCOL_ECHELON);
    if (echelonInfo) protocols.push(echelonInfo);

    return protocols;
  }, [getProtocolStats]);

  /**
   * Get total staked across all protocols
   */
  const getTotalStaked = useCallback(async (): Promise<number> => {
    try {
      const result = await aptosClient().view({
        payload: {
          function: `${SAFEBET_ADDRESS}::pool_staking::get_total_staked`,
          typeArguments: [],
          functionArguments: [SAFEBET_ADDRESS],
        },
      });

      return Number(result[0]);
    } catch (error) {
      console.error("[useStaking] Error getting total staked:", error);
      return 0;
    }
  }, []);

  /**
   * Get total yield generated
   */
  const getTotalYieldGenerated = useCallback(async (): Promise<number> => {
    try {
      const result = await aptosClient().view({
        payload: {
          function: `${SAFEBET_ADDRESS}::pool_staking::get_total_yield_generated`,
          typeArguments: [],
          functionArguments: [SAFEBET_ADDRESS],
        },
      });

      return Number(result[0]);
    } catch (error) {
      console.error("[useStaking] Error getting total yield:", error);
      return 0;
    }
  }, []);

  /**
   * Set the default protocol for new stakes (admin only)
   */
  const setDefaultProtocol = useCallback(
    async (protocol: number): Promise<StakingResult> => {
      if (!account?.address) {
        return { success: false, error: "Wallet not connected" };
      }

      setIsStaking(true);
      setLastResult(null);

      try {
        const response = await signAndSubmitTransaction({
          data: {
            function: `${SAFEBET_ADDRESS}::pool_staking::set_default_protocol`,
            typeArguments: [],
            functionArguments: [SAFEBET_ADDRESS, protocol],
          },
        });

        await aptosClient().waitForTransaction({
          transactionHash: response.hash,
        });

        const result: StakingResult = {
          success: true,
          hash: response.hash,
        };

        setLastResult(result);
        return result;
      } catch (error: unknown) {
        console.error("[useStaking] Error setting default protocol:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

        const result: StakingResult = {
          success: false,
          error: errorMessage,
        };

        setLastResult(result);
        return result;
      } finally {
        setIsStaking(false);
      }
    },
    [account, signAndSubmitTransaction]
  );

  /**
   * Update Echelon APY (admin only)
   */
  const updateEchelonApy = useCallback(
    async (newApyBps: number): Promise<StakingResult> => {
      if (!account?.address) {
        return { success: false, error: "Wallet not connected" };
      }

      setIsStaking(true);
      setLastResult(null);

      try {
        const response = await signAndSubmitTransaction({
          data: {
            function: `${SAFEBET_ADDRESS}::pool_staking::update_echelon_apy`,
            typeArguments: [],
            functionArguments: [SAFEBET_ADDRESS, newApyBps],
          },
        });

        await aptosClient().waitForTransaction({
          transactionHash: response.hash,
        });

        const result: StakingResult = {
          success: true,
          hash: response.hash,
        };

        setLastResult(result);
        return result;
      } catch (error: unknown) {
        console.error("[useStaking] Error updating Echelon APY:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

        const result: StakingResult = {
          success: false,
          error: errorMessage,
        };

        setLastResult(result);
        return result;
      } finally {
        setIsStaking(false);
      }
    },
    [account, signAndSubmitTransaction]
  );

  /**
   * Set protocol active status (admin only)
   */
  const setProtocolActive = useCallback(
    async (protocol: number, isActive: boolean): Promise<StakingResult> => {
      if (!account?.address) {
        return { success: false, error: "Wallet not connected" };
      }

      setIsStaking(true);
      setLastResult(null);

      try {
        const response = await signAndSubmitTransaction({
          data: {
            function: `${SAFEBET_ADDRESS}::pool_staking::set_protocol_active`,
            typeArguments: [],
            functionArguments: [SAFEBET_ADDRESS, protocol, isActive],
          },
        });

        await aptosClient().waitForTransaction({
          transactionHash: response.hash,
        });

        const result: StakingResult = {
          success: true,
          hash: response.hash,
        };

        setLastResult(result);
        return result;
      } catch (error: unknown) {
        console.error("[useStaking] Error setting protocol active:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

        const result: StakingResult = {
          success: false,
          error: errorMessage,
        };

        setLastResult(result);
        return result;
      } finally {
        setIsStaking(false);
      }
    },
    [account, signAndSubmitTransaction]
  );

  return {
    // State
    isStaking,
    isUnstaking: _isUnstaking,
    lastResult,
    isConnected: !!account,

    // Read functions
    getStakingPosition,
    getProtocolStats,
    getBestApy,
    getAllProtocolInfo,
    getTotalStaked,
    getTotalYieldGenerated,

    // Write functions (admin)
    setDefaultProtocol,
    updateEchelonApy,
    setProtocolActive,

    // Protocol constants
    PROTOCOL_AAVE,
    PROTOCOL_ECHELON,
  };
}
