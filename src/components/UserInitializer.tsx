"use client";

import { useEffect, useRef } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createOrGetUser } from "@/lib/database";

/**
 * This component handles user registration in Supabase
 * whenever a wallet connects. It should be placed in the root layout.
 */
export function UserInitializer() {
  const { account, connected } = useWallet();
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      const userAddress = account?.address?.toString();
      
      // Only initialize if:
      // 1. Wallet is connected
      // 2. We have an address
      // 3. We haven't already initialized this address
      if (connected && userAddress && initializedRef.current !== userAddress) {
        console.log("[UserInitializer] Wallet connected, initializing user:", userAddress);
        
        try {
          const user = await createOrGetUser(userAddress);
          if (user) {
            console.log("[UserInitializer] User initialized successfully:", user);
            initializedRef.current = userAddress;
          } else {
            console.error("[UserInitializer] Failed to initialize user");
          }
        } catch (error) {
          console.error("[UserInitializer] Error initializing user:", error);
        }
      }
    };

    initializeUser();
  }, [connected, account?.address]);

  // Reset when disconnected
  useEffect(() => {
    if (!connected) {
      console.log("[UserInitializer] Wallet disconnected, resetting");
      initializedRef.current = null;
    }
  }, [connected]);

  // This component doesn't render anything
  return null;
}
