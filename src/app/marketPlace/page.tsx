"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ItemCard from "@/components/ItemComp";
import CreateLotteryModal from "@/components/CreateLotteryModal";
import { truncateAddress, useWallet } from "@aptos-labs/wallet-adapter-react";
import { getAllPools } from "@/lib/database";
import type { PoolCreate } from "@/types/supabase";
import { usePickWinner } from "@/hooks/usePickWinner";
import { toast } from "@/components/ui/use-toast";

// MarketItem type for display
type MarketItem = {
  id: string;
  name: string;
  subname: string;
  price: string;
  change: string;
  isPositive: boolean;
  contract: string;
  holders: string;
  image: string;
  createdAt: string | null;
  poolAddress: string | null;
  isExpired: boolean;
};

// Default images for dynamically created pools
const DEFAULT_POOL_IMAGES = [
  "https://picsum.photos/seed/pool1/400/400",
  "https://picsum.photos/seed/pool2/400/400",
  "https://picsum.photos/seed/pool3/400/400",
  "https://picsum.photos/seed/pool4/400/400",
  "https://picsum.photos/seed/pool5/400/400",
  "https://picsum.photos/seed/pool6/400/400",
  "https://picsum.photos/seed/pool7/400/400",
  "https://picsum.photos/seed/pool8/400/400",
];

// 7 days in milliseconds
const DRAW_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

// Check if a pool is expired (7 days since creation)
const isPoolExpired = (createdAt: string | null): boolean => {
  if (!createdAt) return false;
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  return now - createdTime >= DRAW_INTERVAL_MS;
};

// Convert database pool to MarketItem format
const poolToMarketItem = (pool: PoolCreate, index: number): MarketItem => {
  const expired = isPoolExpired(pool.created_at);
  return {
    id: `pool-${pool.id}`,
    name: pool.name,
    subname: `Pool #${pool.id.slice(0, 6)}`,
    price: `$${pool.pool.toLocaleString()}`,
    change: "+0%",
    isPositive: true,
    contract: `0x${pool.id.slice(0, 3)}...${pool.id.slice(-4)}`,
    holders: "0.00%",
    image: DEFAULT_POOL_IMAGES[index % DEFAULT_POOL_IMAGES.length],
    createdAt: pool.created_at,
    poolAddress: pool.pool_address,
    isExpired: expired,
  };
};

const Marketplace = () => {
  const { account } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbPools, setDbPools] = useState<MarketItem[]>([]);
  const [isLoadingPools, setIsLoadingPools] = useState(true);
  const [pickingWinnerFor, setPickingWinnerFor] = useState<string | null>(null);
  const [resolvedPools, setResolvedPools] = useState<Set<string>>(new Set());
  const { autoResolve, isPicking } = usePickWinner();

  // Demo/Real mode toggle
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Pick winner animation state
  const [pickingPhase, setPickingPhase] = useState<"idle" | "shuffling" | "revealing" | "done">("idle");
  const [shuffleAddress, setShuffleAddress] = useState("");
  const [winner, setWinner] = useState<{ address: string; prize: string; txHash: string } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Get the first pool with a pool_address for picking
  const getDemoPool = (): MarketItem | null => {
    const poolWithAddress = dbPools.find((pool) => pool.poolAddress && !resolvedPools.has(pool.id));
    return poolWithAddress || null;
  };

  const demoPool = getDemoPool();

  // Simulated participants for shuffle animation
  const demoParticipants = [
    "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
    "0x3c4d5e6f7890abcdef1234567890abcdef123456",
    "0x4d5e6f7890abcdef1234567890abcdef12345678",
    "0x5e6f7890abcdef1234567890abcdef1234567890",
    "0x6f7890abcdef1234567890abcdef12345678901a",
    "0x7890abcdef1234567890abcdef12345678901a2b",
    "0x890abcdef1234567890abcdef12345678901a2b3c",
    account?.address?.toString() || "0x0000000000000000000000000000000000000000",
  ];

  // Pick winner handler - works for both demo and real mode
  const handlePickWinnerMain = async () => {
    if (!demoPool?.poolAddress) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No pool available. Create a pool first!",
      });
      return;
    }

    setPickingPhase("shuffling");
    setWinner(null);
    setTxHash(null);

    // Start shuffle animation
    const shuffleInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * demoParticipants.length);
      setShuffleAddress(demoParticipants[randomIndex]);
    }, 100);

    if (isDemoMode) {
      // Demo mode - simulate without blockchain
      await new Promise((resolve) => setTimeout(resolve, 3000));
      clearInterval(shuffleInterval);
      setPickingPhase("revealing");

      let revealCount = 0;
      const revealInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * demoParticipants.length);
        setShuffleAddress(demoParticipants[randomIndex]);
        revealCount++;

        if (revealCount >= 5) {
          clearInterval(revealInterval);

          const winnerIndex = Math.floor(Math.random() * demoParticipants.length);
          const winnerAddress = demoParticipants[winnerIndex];
          const fakeTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

          setWinner({
            address: winnerAddress,
            prize: demoPool.price,
            txHash: fakeTxHash,
          });
          setTxHash(fakeTxHash);
          setPickingPhase("done");
          setResolvedPools((prev) => new Set([...prev, demoPool.id]));

          toast({
            title: "Winner Picked! 🎉 (Demo)",
            description: "Demo mode: Winner simulated successfully!",
          });
        }
      }, 400);
    } else {
      // Real mode - call blockchain
      try {
        console.log("[PickWinner] Calling autoResolve for pool:", demoPool.poolAddress);
        const result = await autoResolve(demoPool.poolAddress);

        clearInterval(shuffleInterval);
        setPickingPhase("revealing");

        let revealCount = 0;
        const revealInterval = setInterval(() => {
          const randomIndex = Math.floor(Math.random() * demoParticipants.length);
          setShuffleAddress(demoParticipants[randomIndex]);
          revealCount++;

          if (revealCount >= 5) {
            clearInterval(revealInterval);

            if (result.success) {
              const winnerAddress = account?.address?.toString() || demoParticipants[0];
              setWinner({
                address: winnerAddress,
                prize: demoPool.price,
                txHash: result.hash || "",
              });
              setTxHash(result.hash || null);
              setPickingPhase("done");
              setResolvedPools((prev) => new Set([...prev, demoPool.id]));

              toast({
                title: "Winner Picked! 🎉",
                description: `Transaction confirmed: ${result.hash?.slice(0, 10)}...`,
              });
            } else {
              setPickingPhase("idle");
              toast({
                variant: "destructive",
                title: "Transaction Failed",
                description: result.error || "Failed to pick winner on-chain.",
              });
            }
          }
        }, 400);
      } catch (error) {
        clearInterval(shuffleInterval);
        setPickingPhase("idle");
        console.error("[PickWinner] Error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to pick winner. Please try again.",
        });
      }
    }
  };

  // Reset for another pick
  const handleReset = () => {
    setPickingPhase("idle");
    setShuffleAddress("");
    setWinner(null);
    setTxHash(null);
  };

  // Fetch pools from database
  useEffect(() => {
    const fetchPools = async () => {
      setIsLoadingPools(true);
      try {
        const pools = await getAllPools();
        const convertedPools = pools.map((pool, index) => poolToMarketItem(pool, index));
        setDbPools(convertedPools);
      } catch (error) {
        console.error("[Marketplace] Error fetching pools:", error);
      } finally {
        setIsLoadingPools(false);
      }
    };

    fetchPools();
  }, []);

  // Filter pools based on search query
  const filteredData = dbPools.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.subname.toLowerCase().includes(query) ||
      item.contract.toLowerCase().includes(query)
    );
  });

  // Callback to refresh pools after creating a new one
  const handlePoolCreated = async () => {
    try {
      const pools = await getAllPools();
      const convertedPools = pools.map((pool, index) => poolToMarketItem(pool, index));
      setDbPools(convertedPools);
    } catch (error) {
      console.error("[Marketplace] Error refreshing pools:", error);
    }
  };

  // Get expired pools that haven't been resolved yet
  const expiredPools = dbPools.filter((pool) => pool.isExpired && pool.poolAddress && !resolvedPools.has(pool.id));

  // Handle picking winner for an expired pool
  const handlePickWinner = async (pool: MarketItem) => {
    if (!pool.poolAddress) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Pool address not found",
      });
      return;
    }

    setPickingWinnerFor(pool.id);

    try {
      const result = await autoResolve(pool.poolAddress);

      if (result.success) {
        toast({
          title: "Winner Picked! 🎉",
          description: `Successfully resolved ${pool.name}. Transaction: ${result.hash?.slice(0, 10)}...`,
        });
        setResolvedPools((prev) => new Set([...prev, pool.id]));
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Pick Winner",
          description: result.error || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("[Marketplace] Error picking winner:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to pick winner. Please try again.",
      });
    } finally {
      setPickingWinnerFor(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col items-center">
      <CreateLotteryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPoolCreated={handlePoolCreated}
      />

      <div className="w-full max-w-7xl border-x-2 border-black min-h-screen flex flex-col bg-white">
        {/* --- HEADER --- */}
        <header className="flex justify-between items-stretch border-b-2 border-black h-20">
          <div className="w-20 border-r-2 border-black relative overflow-hidden hidden md:block">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:10px_10px] [transform:scale(1.5)_rotate(15deg)]"></div>
          </div>
          <div className="flex-1 flex items-center justify-end px-8">
            <Link
              href={"/profile"}
              className="bg-[#ff7a50] flex items-center gap-3 text-black font-bold border-2 border-black py-2 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <span>{truncateAddress(account?.address.toStringLong())}</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </div>
          <div className="w-20 border-l-2 border-black relative overflow-hidden hidden md:block">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:14px_14px]"></div>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 p-8 md:p-12 flex flex-col gap-16">
          {/* Search Bar */}
          <div className="w-full max-w-2xl mx-auto flex">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, subname, or contract..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-2 border-black border-r-0 py-3 pl-10 pr-4 font-mono focus:outline-none bg-gray-50 h-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>
            <button className="bg-[#baff73] border-2 border-black font-bold px-8 h-12 hover:bg-[#a3e660] transition-colors">
              Search
            </button>
          </div>

          {/* PICK WINNER SECTION */}
          <div className="flex flex-col gap-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-[#ff6b6b] border-2 border-black px-6 py-2">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                  🎰 PICK WINNERS
                </h2>
              </div>
              <span className="bg-black text-white px-3 py-1 text-sm font-bold">
                {(demoPool && pickingPhase !== "done" ? 1 : 0) + expiredPools.filter((p) => p.id !== demoPool?.id).length}{" "}
                Ready
              </span>
              <span className={`${isDemoMode ? "bg-purple-500" : "bg-green-500"} text-white px-3 py-1 text-sm font-bold`}>
                {isDemoMode ? "🎭 DEMO" : "⛓️ ON-CHAIN"}
              </span>
              <span className="bg-red-500 text-white px-3 py-1 text-sm font-bold animate-pulse">LIVE DRAW</span>

              {/* Demo Mode Toggle */}
              <div className="flex items-center gap-2 ml-auto">
                <span className={`text-sm font-bold ${!isDemoMode ? "text-green-600" : "text-gray-400"}`}>Real</span>
                <button
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className={`relative w-14 h-7 rounded-full border-2 border-black transition-colors ${
                    isDemoMode ? "bg-purple-500" : "bg-green-500"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white border-2 border-black rounded-full transition-transform ${
                      isDemoMode ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className={`text-sm font-bold ${isDemoMode ? "text-purple-600" : "text-gray-400"}`}>Demo</span>
              </div>
            </div>

            <p className="font-mono text-gray-700">
              {isDemoMode ? (
                <span className="text-purple-600">
                  <strong>🎭 Demo Mode:</strong> Simulates the lottery flow without blockchain transactions. Perfect for
                  showcasing!
                </span>
              ) : (
                <span className="text-green-600">
                  <strong>⛓️ Real Mode:</strong> Actual blockchain transactions. Winners are picked on-chain!
                </span>
              )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* LOTTERY CARD */}
              {demoPool && pickingPhase !== "done" && (
                <div
                  className={`bg-white border-2 border-black p-4 flex flex-col gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden
                  ${pickingPhase === "shuffling" ? "animate-pulse" : ""}`}
                >
                  {/* Animated background during shuffle */}
                  {pickingPhase === "shuffling" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-200 opacity-50" />
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center gap-3">
                      <img
                        src={demoPool.image}
                        alt={demoPool.name}
                        className={`w-12 h-12 border-2 border-black object-cover ${pickingPhase === "shuffling" ? "animate-bounce" : ""}`}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-lg truncate">{demoPool.name}</h3>
                        <p className="font-mono text-sm text-gray-600 truncate">
                          {demoPool.poolAddress?.slice(0, 8)}...{demoPool.poolAddress?.slice(-6)}
                        </p>
                      </div>
                      <span
                        className={`${isDemoMode ? "bg-purple-500" : "bg-green-500"} text-white text-xs px-2 py-1 font-bold`}
                      >
                        {isDemoMode ? "DEMO" : "ON-CHAIN"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm font-mono mt-3">
                      <span className="text-gray-600">Prize Pool:</span>
                      <span className="font-bold text-xl text-green-600">{demoPool.price}</span>
                    </div>

                    {/* Shuffle display */}
                    {(pickingPhase === "shuffling" || pickingPhase === "revealing") && (
                      <div className="mt-3 p-3 bg-black text-green-400 font-mono text-center rounded border-2 border-green-500">
                        <p className="text-xs text-gray-400 mb-1">
                          {pickingPhase === "shuffling"
                            ? isDemoMode
                              ? "🎭 SIMULATING..."
                              : "🔗 SENDING TO BLOCKCHAIN..."
                            : "🎲 SELECTING WINNER..."}
                        </p>
                        <p className={`text-sm truncate ${pickingPhase === "revealing" ? "text-yellow-400 text-lg" : ""}`}>
                          {shuffleAddress.slice(0, 10)}...{shuffleAddress.slice(-8)}
                        </p>
                      </div>
                    )}

                    {/* Pick Winner Button */}
                    <button
                      onClick={handlePickWinnerMain}
                      disabled={pickingPhase !== "idle" || isPicking}
                      className={`w-full mt-3 ${isDemoMode ? "bg-purple-500 hover:bg-purple-600" : "bg-[#ff7a50] hover:bg-[#ff9470]"} border-2 border-black py-3 px-4 font-black uppercase tracking-wider
                        active:translate-y-[2px] active:shadow-none text-white
                        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pickingPhase === "idle" ? (
                        `🎲 Pick Winner ${isDemoMode ? "(Demo)" : "(On-Chain)"}`
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          {pickingPhase === "shuffling" ? "Processing..." : "Revealing..."}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* No pool available message */}
              {!demoPool && pickingPhase !== "done" && (
                <div className="bg-white border-2 border-dashed border-gray-400 p-4 flex flex-col gap-3 items-center justify-center text-center">
                  <p className="text-gray-500 font-mono">No pools with on-chain address available</p>
                  <p className="text-sm text-gray-400">Create a pool first to enable live demo</p>
                </div>
              )}

              {/* Winner Reveal Card */}
              {pickingPhase === "done" && winner && demoPool && (
                <div className="col-span-full md:col-span-2 lg:col-span-3 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="bg-white border-2 border-black p-6 text-center">
                    <div className="text-6xl mb-4">🎉🏆🎉</div>
                    <h3 className="text-3xl font-black uppercase mb-2">WINNER SELECTED!</h3>
                    <p className="font-mono text-gray-600 mb-4">{demoPool.name}</p>

                    <div className="bg-black text-white p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-400 mb-1">Winner Address</p>
                      <p className="font-mono text-lg text-green-400 break-all">{winner.address}</p>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Prize Won</p>
                        <p className="text-4xl font-black text-green-600">{winner.prize}</p>
                      </div>
                    </div>

                    {txHash && (
                      <div className="bg-gray-100 border border-gray-300 p-3 rounded-lg mb-4">
                        <p className="text-xs text-gray-500 mb-1">Transaction Hash {isDemoMode && "(Simulated)"}</p>
                        <p className="font-mono text-sm text-gray-700 break-all">{txHash}</p>
                      </div>
                    )}

                    <div className="flex gap-4 justify-center flex-wrap">
                      <button
                        onClick={handleReset}
                        className="bg-[#4fe869] border-2 border-black py-2 px-6 font-black uppercase
                          hover:bg-[#3dd858] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        🔄 Pick Another
                      </button>
                      {txHash && !isDemoMode && (
                        <a
                          href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#baff73] border-2 border-black py-2 px-6 font-black uppercase
                            hover:bg-[#a3e660] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all inline-block"
                        >
                          View on Explorer →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Real expired pools */}
              {expiredPools.map((pool) => (
                <div
                  key={pool.id}
                  className="bg-white border-2 border-black p-4 flex flex-col gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-center gap-3">
                    <img src={pool.image} alt={pool.name} className="w-12 h-12 border-2 border-black object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg truncate">{pool.name}</h3>
                      <p className="font-mono text-sm text-gray-600 truncate">
                        {pool.poolAddress?.slice(0, 8)}...{pool.poolAddress?.slice(-6)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm font-mono">
                    <span className="text-gray-600">Pool Value:</span>
                    <span className="font-bold">{pool.price}</span>
                  </div>

                  <button
                    onClick={() => handlePickWinner(pool)}
                    disabled={isPicking && pickingWinnerFor === pool.id}
                    className="w-full bg-[#ff7a50] border-2 border-black py-2 px-4 font-black uppercase tracking-wider
                      hover:bg-[#ff9470] active:translate-y-[2px] active:shadow-none 
                      shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ff7a50]"
                  >
                    {isPicking && pickingWinnerFor === pool.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Picking...
                      </span>
                    ) : (
                      "🎲 Pick Winner"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* LISTINGS */}
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="bg-[#ff6b6b] border-2 border-black w-fit px-8 py-2 ">
                <h2 className="text-2xl font-black uppercase tracking-widest">ALL LISTINGS</h2>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#4fe869] border-2 border-black w-fit px-8 py-2 cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
              >
                <h2 className="text-2xl font-black uppercase tracking-widest">CREATE LOTTERY</h2>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
              {isLoadingPools ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-2xl font-black uppercase text-gray-400">Loading pools...</p>
                </div>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <Link key={item.id} href={`/marketPlace/${item.id}`}>
                    <ItemCard name={item.name} subname={item.subname} image={item.image} />
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-2xl font-black uppercase text-gray-400">No results found</p>
                  <p className="font-mono text-gray-500 mt-2">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Marketplace;
