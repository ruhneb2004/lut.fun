"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { truncateAddress, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import HowItWorksModal from "@/components/HowItWorksModal";
import { TOKENS, Token, fromOnChainAmount } from "@/utils/tokens";
import { usePoolDeposit } from "@/hooks/usePoolDeposit";
import { usePoolWithdraw } from "@/hooks/usePoolWithdraw";
import { usePoolInfo, useParticipantInfo, POOL_STATUS } from "@/hooks/usePoolInfo";
import { getAccountAPTBalance } from "@/view-functions/getAccountBalance";
import { getPoolById, getChartData, getTopHolders, addChartData } from "@/lib/database";
import type { PoolCreate, ChartData, TopHolder } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";

// Default images for pools
const DEFAULT_POOL_IMAGES = [
  "https://picsum.photos/seed/pool1/400/400",
  "https://picsum.photos/seed/pool2/400/400",
  "https://picsum.photos/seed/pool3/400/400",
  "https://picsum.photos/seed/pool4/400/400",
  "https://picsum.photos/seed/pool5/400/400",
  "https://picsum.photos/seed/pool6/400/400",
];

// Get image for a pool based on its ID
const getPoolImage = (poolId: string): string => {
  // Use the pool ID to deterministically select an image
  const hash = poolId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEFAULT_POOL_IMAGES[hash % DEFAULT_POOL_IMAGES.length];
};

// Countdown Timer Component
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-2 justify-center">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black">{String(timeLeft.days).padStart(2, "0")}</span>
        <span className="text-[10px] font-mono text-gray-400">DAYS</span>
      </div>
      <span className="text-2xl font-black">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black">{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="text-[10px] font-mono text-gray-400">HRS</span>
      </div>
      <span className="text-2xl font-black">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black">{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="text-[10px] font-mono text-gray-400">MIN</span>
      </div>
      <span className="text-2xl font-black">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black">{String(timeLeft.seconds).padStart(2, "0")}</span>
        <span className="text-[10px] font-mono text-gray-400">SEC</span>
      </div>
    </div>
  );
}

export default function ProductDetailsClient({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { account } = useWallet();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Token and amount states
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]); // Default to APT
  const [amount, setAmount] = useState<string>("");
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const selectedOutcome = "YES"; // Default outcome for deposit

  // Pool deposit hook
  const { deposit, isLoading: isDepositing } = usePoolDeposit();

  // Pool withdraw hook
  const { withdraw, isLoading: isWithdrawing } = usePoolWithdraw();

  // Database state
  const [pool, setPool] = useState<PoolCreate | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topHolders, setTopHolders] = useState<TopHolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  // Extract pool ID from slug (format: "pool-{uuid}")
  const poolId = slug.startsWith("pool-") ? slug.replace("pool-", "") : null;

  // Get pool address from database (will be set after pool is fetched)
  const poolAddress = pool?.pool_address || null;

  // Get pool info from on-chain (only if we have a pool address)
  const { data: poolInfo } = usePoolInfo(poolAddress || "");

  // Get user's participant info (to check if they have deposited)
  const { data: participantInfo } = useParticipantInfo(poolAddress || undefined, account?.address?.toStringLong());

  // Get user's APT balance
  const { data: balanceData } = useQuery({
    queryKey: ["apt-balance", account?.address],
    enabled: !!account?.address,
    refetchInterval: 10_000,
    queryFn: async () => {
      if (!account) return { balance: 0 };
      const balance = await getAccountAPTBalance({
        accountAddress: account.address.toStringLong(),
      });
      return { balance };
    },
  });

  const userBalance = balanceData?.balance ? fromOnChainAmount(balanceData.balance, 8) : 0;

  // Calculate next draw date (7 days from pool creation or last draw)
  const nextDrawDate = useMemo(() => {
    if (poolInfo?.lastDrawAt && poolInfo.lastDrawAt > 0) {
      return new Date((poolInfo.lastDrawAt + 7 * 24 * 60 * 60) * 1000);
    } else if (poolInfo?.createdAt) {
      return new Date((poolInfo.createdAt + 7 * 24 * 60 * 60) * 1000);
    } else if (pool?.created_at) {
      const createdDate = new Date(pool.created_at);
      createdDate.setDate(createdDate.getDate() + 7);
      return createdDate;
    }
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  }, [poolInfo, pool]);

  // Prepare chart data for recharts
  const rechartsData = useMemo(() => {
    if (chartData.length === 0) {
      const baseValue = poolInfo ? fromOnChainAmount(poolInfo.totalPoolAmount, 8) : 0;
      const now = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          value: baseValue * (0.8 + Math.random() * 0.4),
          fullDate: date.toISOString(),
        };
      });
    }

    let cumulativeValue = 0;
    const dataPoints: { date: string; value: number; fullDate: string }[] = [];

    chartData.forEach((data) => {
      if (data.action === "buy") {
        cumulativeValue += data.amount;
      } else {
        cumulativeValue -= data.amount;
      }

      const date = new Date(data.created_at || "");
      dataPoints.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.max(0, cumulativeValue),
        fullDate: date.toISOString(),
      });
    });

    return dataPoints;
  }, [chartData, poolInfo]);

  // Get current total pool value (from on-chain)
  const totalPoolValue = poolInfo ? fromOnChainAmount(poolInfo.totalPoolAmount, 8) : 0;

  // Fetch pool data from database by ID
  useEffect(() => {
    const fetchPoolData = async () => {
      if (!poolId) {
        setNotFoundError(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch pool by ID
        const poolData = await getPoolById(poolId);

        if (poolData) {
          setPool(poolData);

          // Fetch chart data and top holders
          const [chartDataResult, topHoldersResult] = await Promise.all([
            getChartData(poolData.id),
            getTopHolders(poolData.id),
          ]);

          setChartData(chartDataResult);
          setTopHolders(topHoldersResult);
        } else {
          setNotFoundError(true);
        }
      } catch (error) {
        console.error("[ProductDetails] Error fetching pool data:", error);
        setNotFoundError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoolData();
  }, [poolId]);

  // Calculate holder percentage
  const calculateHolderPercentage = (holder: TopHolder): string => {
    if (!pool || pool.total === 0) return "0.00%";
    return ((holder.ticket_count / pool.total) * 100).toFixed(2) + "%";
  };

  // Get pool image based on ID
  const poolImage = pool ? getPoolImage(pool.id) : "";

  // Debugging
  console.log("Slug from URL:", slug);
  console.log("Pool ID:", poolId);
  console.log("Found Pool:", pool);

  if (notFoundError && !isLoading) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col items-center">
      <div className="w-full max-w-7xl border-x-2 border-black min-h-screen flex flex-col bg-white">
        {/* --- HEADER --- */}
        <header className="flex justify-between items-stretch border-b-2 border-black h-20">
          <div className="w-20 border-r-2 border-black relative overflow-hidden hidden md:block">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:10px_10px] [transform:scale(1.5)_rotate(15deg)]"></div>
          </div>

          <div className="flex-1 flex items-center justify-between px-8">
            {/* Back Navigation */}
            <Link href="/marketPlace" className="font-mono font-bold text-sm underline hover:text-gray-600">
              ← Back to Market
            </Link>

            <div className="flex gap-8 items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="font-mono font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                How it works
              </button>
              <button className="bg-[#ff7a50] text-black font-bold border-2 border-black py-2 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                {truncateAddress(account?.address.toStringLong())}
              </button>
            </div>
          </div>

          <div className="w-20 border-l-2 border-black relative overflow-hidden hidden md:block">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:14px_14px]"></div>
          </div>
        </header>

        {/* --- MAIN PAGE CONTENT --- */}
        <main className="flex-1 p-8 md:p-12 flex flex-col lg:flex-row gap-12">
          {/* === LEFT COLUMN === */}
          <div className="flex-1 flex flex-col gap-12">
            {/* PRODUCT BANNER */}
            <div className="w-full border-2 border-black bg-gray-50 relative overflow-hidden flex flex-col md:flex-row p-6 gap-6">
              <div className="absolute top-0 right-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:20px_20px] [transform:perspective(200px)_rotateY(-10deg)] origin-right"></div>
              </div>

              {/* Profile Image */}
              <div className="w-32 h-32 shrink-0 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                {poolImage ? (
                  <Image src={poolImage} alt={pool?.name || "Pool"} fill className="object-cover" sizes="128px" />
                ) : (
                  <div className="w-full h-full bg-black"></div>
                )}
              </div>

              <div className="flex-1 z-10 flex flex-col justify-between">
                <div>
                  {/* Dynamic Name and Subname */}
                  <h1 className="text-4xl font-black uppercase leading-none">{pool?.name || "Loading..."}</h1>
                  <h2 className="text-xl font-black text-gray-500 uppercase">Pool #{pool?.id.slice(0, 6) || "..."}</h2>
                  <div className="flex items-center gap-2 mt-2 text-sm font-mono text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <span>
                      &lt;creator&gt; • {pool?.created_at ? new Date(pool.created_at).toLocaleDateString() : "..."}
                    </span>
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 bg-gray-200 border border-black px-2 py-1 w-fit font-mono text-xs cursor-pointer hover:bg-gray-300">
                  <span>📑</span>
                  {/* Dynamic Contract Address */}
                  <span>
                    {pool?.pool_address
                      ? `${pool.pool_address.slice(0, 6)}...${pool.pool_address.slice(-4)}`
                      : "No contract"}
                  </span>
                </div>
              </div>

              <div className="z-10 flex flex-col gap-3 items-end justify-start">
                <button className="bg-[#baff73] text-black font-black text-xs uppercase px-6 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                  Share <span className="text-lg">T</span>
                </button>
                <button className="bg-[#ffbd59] text-black font-black text-xs uppercase px-6 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                  Save <span className="text-lg">★</span>
                </button>

                {/* Countdown Timer */}
                <div className="mt-2 bg-black text-white px-4 py-3 border-2 border-black">
                  <p className="text-[10px] font-mono text-gray-400 text-center mb-1">NEXT DRAW IN</p>
                  <CountdownTimer targetDate={nextDrawDate} />
                </div>
              </div>
            </div>

            {/* CHART SECTION */}
            <div className="w-full border-2 border-black bg-white p-6 h-[500px] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-4">
                <p className="font-mono text-sm text-gray-600">Total Pool Value</p>
                <h3 className="text-4xl font-black uppercase">{totalPoolValue.toFixed(2)} APT</h3>
                <p className="font-mono text-xs font-bold mt-1 text-green-600">
                  {poolInfo && pool
                    ? `+${((totalPoolValue / (pool.pool || 1)) * 100).toFixed(2)}% of target`
                    : "+0.00%"}
                </p>
                {pool && (
                  <p className="font-mono text-xs text-gray-500 mt-1">
                    Target: {pool.pool} APT | Participants: {poolInfo?.totalPoolAmount ? "Active" : "0"}
                  </p>
                )}
              </div>

              {/* Recharts Area Chart */}
              <div className="flex-1 w-full">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-400 font-mono">
                    Loading chart data...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rechartsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#57f287" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#57f287" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "monospace" }} stroke="#666" />
                      <YAxis
                        tick={{ fontSize: 10, fontFamily: "monospace" }}
                        stroke="#666"
                        tickFormatter={(value) => `${value.toFixed(1)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000",
                          border: "2px solid #000",
                          borderRadius: 0,
                          fontFamily: "monospace",
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "#fff", fontWeight: "bold" }}
                        itemStyle={{ color: "#57f287" }}
                        formatter={(value: number) => [`${value.toFixed(4)} APT`, "Pool Value"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#57f287"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* === RIGHT COLUMN === */}
          <div className="w-full lg:w-80 flex flex-col gap-8">
            <div className="border-2 border-black bg-gray-50 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {/* Buy/Sell Tabs */}
              <div className="flex gap-4 mb-6 justify-center">
                <button
                  onClick={() => setActiveTab("buy")}
                  className={`flex-1 border-2 border-black py-2 font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all ${
                    activeTab === "buy" ? "bg-[#57f287]" : "bg-gray-200"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setActiveTab("sell")}
                  className={`flex-1 border-2 border-black py-2 font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all ${
                    activeTab === "sell" ? "bg-[#ffbd59]" : "bg-gray-200"
                  }`}
                >
                  Sell
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Token Selector Dropdown */}
                <div className="relative">
                  <label className="text-xs font-bold uppercase text-gray-600 mb-1 block">Token</label>
                  <div
                    onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                    className="border-2 border-black bg-white h-12 w-full flex items-center px-4 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-bold">
                        {activeTab === "buy" ? selectedToken.symbol : pool?.name || "Pool Token"}
                      </span>
                      <span className="text-gray-500 text-sm">{activeTab === "sell" ? "" : selectedToken?.name}</span>
                    </div>
                    <span className={`transition-transform ${isTokenDropdownOpen ? "rotate-180" : ""}`}>⌄</span>
                  </div>

                  {/* Dropdown Options */}
                  {isTokenDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {activeTab === "buy" ? (
                        TOKENS.map((token) => (
                          <div
                            key={token.symbol}
                            onClick={() => {
                              setSelectedToken(token);
                              setIsTokenDropdownOpen(false);
                            }}
                            className={`px-4 py-3 flex items-center gap-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-b-0 ${
                              selectedToken.symbol === token.symbol ? "bg-gray-100" : ""
                            }`}
                          >
                            <span className="font-bold">{token.symbol}</span>
                            <span className="text-gray-500 text-sm">{token.name}</span>
                          </div>
                        ))
                      ) : (
                        <div
                          onClick={() => {}}
                          className={`px-4 py-3 flex items-center gap-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-b-0 `}
                        >
                          <span className="font-bold">{pool?.name || "Pool Token"}</span>
                          <span className="text-gray-500 text-sm">Pool Tickets</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount Input */}
                <div className="relative">
                  <label className="text-xs font-bold uppercase text-gray-600 mb-1 block">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="border-2 border-black bg-white h-12 w-full px-4 pr-16 font-mono focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                      {activeTab === "buy" ? selectedToken.symbol : ""}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>
                      Balance: {userBalance.toFixed(4)} {selectedToken.symbol}
                    </span>
                    <button
                      onClick={() => setAmount(userBalance.toString())}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Pool Info */}
                {poolInfo && (
                  <div className="bg-gray-100 border border-gray-300 p-3 text-xs font-mono">
                    <div className="flex justify-between mb-1">
                      <span>Pool Status:</span>
                      <span className={poolInfo.status === POOL_STATUS.OPEN ? "text-green-600" : "text-red-600"}>
                        {poolInfo.status === POOL_STATUS.OPEN
                          ? "OPEN"
                          : poolInfo.status === POOL_STATUS.LOCKED
                            ? "LOCKED"
                            : "RESOLVED"}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Min Entry:</span>
                      <span>{fromOnChainAmount(poolInfo.minEntry, 8)} APT</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Max Entry:</span>
                      <span>{fromOnChainAmount(poolInfo.maxEntry, 8)} APT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Pool:</span>
                      <span>{fromOnChainAmount(poolInfo.totalPoolAmount, 8)} APT</span>
                    </div>
                  </div>
                )}

                {/* User's Current Position */}
                {participantInfo && (
                  <div className="bg-blue-50 border border-blue-300 p-3 text-xs font-mono">
                    <div className="font-bold text-blue-700 mb-2">Your Position</div>
                    <div className="flex justify-between mb-1">
                      <span>Deposited:</span>
                      <span>{fromOnChainAmount(participantInfo.amount, 8)} APT</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Tickets:</span>
                      <span>{participantInfo.ticketCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outcome:</span>
                      <span>{participantInfo.outcome}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={async () => {
                    if (!account) {
                      toast({
                        title: "Error",
                        description: "Please connect your wallet first",
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!poolAddress) {
                      toast({
                        title: "Error",
                        description: "Pool address not found",
                        variant: "destructive",
                      });
                      return;
                    }

                    // Handle SELL (withdraw)
                    if (activeTab === "sell") {
                      if (!participantInfo) {
                        toast({
                          title: "Error",
                          description: "You don't have any tickets to sell in this pool",
                          variant: "destructive",
                        });
                        return;
                      }

                      try {
                        // Withdraw from blockchain
                        await withdraw({ poolAddress });

                        // Record to database
                        await addChartData({
                          pool_id: pool?.id || null,
                          action: "sell",
                          amount: fromOnChainAmount(participantInfo.amount, 8),
                        });

                        toast({
                          title: "Success!",
                          description: `Successfully sold your tickets and received ${fromOnChainAmount(participantInfo.amount, 8)} APT`,
                        });
                      } catch (error) {
                        console.error("[ProductDetails] Withdraw error:", error);
                        toast({
                          title: "Error",
                          description: "Withdraw failed",
                          variant: "destructive",
                        });
                      }
                      return;
                    }

                    // Handle BUY (deposit)
                    const numAmount = parseFloat(amount);
                    if (isNaN(numAmount) || numAmount <= 0) {
                      toast({
                        title: "Error",
                        description: "Please enter a valid amount",
                        variant: "destructive",
                      });
                      return;
                    }

                    // Check if user already deposited
                    if (participantInfo) {
                      toast({
                        title: "Error",
                        description:
                          "You have already deposited to this pool. Sell your tickets first to deposit again.",
                        variant: "destructive",
                      });
                      return;
                    }

                    // Validate amount against pool min/max if poolInfo is available
                    if (poolInfo) {
                      const minEntryAPT = fromOnChainAmount(poolInfo.minEntry, 8);
                      const maxEntryAPT = fromOnChainAmount(poolInfo.maxEntry, 8);

                      if (numAmount < minEntryAPT) {
                        toast({
                          title: "Error",
                          description: `Amount must be at least ${minEntryAPT} APT`,
                          variant: "destructive",
                        });
                        return;
                      }

                      if (numAmount > maxEntryAPT) {
                        toast({
                          title: "Error",
                          description: `Amount cannot exceed ${maxEntryAPT} APT`,
                          variant: "destructive",
                        });
                        return;
                      }
                    }

                    try {
                      // Deposit to blockchain
                      await deposit({
                        poolAddress,
                        amount: numAmount,
                        outcome: selectedOutcome,
                        token: selectedToken,
                      });

                      // Record to database
                      await addChartData({
                        pool_id: pool?.id || null,
                        action: "buy",
                        amount: numAmount,
                      });

                      toast({
                        title: "Success!",
                        description: `Successfully bought ${numAmount} APT worth of tickets`,
                      });

                      setAmount(""); // Reset amount after deposit
                    } catch (error) {
                      console.error("[ProductDetails] Transaction error:", error);
                      toast({
                        title: "Error",
                        description: "Transaction failed",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={
                    (activeTab === "buy" && (isDepositing || !account || !amount)) ||
                    (activeTab === "sell" && (isWithdrawing || !account || !participantInfo))
                  }
                  className={`w-full border-2 border-black py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all ${
                    activeTab === "buy" ? "bg-[#57f287]" : "bg-[#ffbd59]"
                  } ${
                    (activeTab === "buy" && (isDepositing || !account || !amount)) ||
                    (activeTab === "sell" && (isWithdrawing || !account || !participantInfo))
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {activeTab === "buy"
                    ? isDepositing
                      ? "Processing..."
                      : "Buy Tickets"
                    : isWithdrawing
                      ? "Processing..."
                      : participantInfo
                        ? `Sell All (${fromOnChainAmount(participantInfo.amount, 8)} APT)`
                        : "No Tickets to Sell"}
                </button>

                {!account && (
                  <p className="text-xs text-center text-red-500 font-bold">Connect wallet to {activeTab}</p>
                )}

                {activeTab === "sell" && account && !participantInfo && (
                  <p className="text-xs text-center text-gray-500">You don't have any tickets in this pool</p>
                )}
              </div>
            </div>

            <div className="border-2 border-black bg-gray-50 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black uppercase text-xl mb-6">TOP HOLDERS</h3>
              <div className="flex flex-col gap-2 font-black text-xs uppercase">
                {isLoading ? (
                  <p className="text-gray-500 font-mono normal-case">Loading holders...</p>
                ) : topHolders.length > 0 ? (
                  topHolders.map((holder, i) => (
                    <div key={holder.id} className="flex items-end w-full">
                      <span className="truncate max-w-[120px]" title={holder.address}>
                        {truncateAddress(holder.address) || `USER ${String(i + 1).padStart(2, "0")}`}
                      </span>
                      <div className="flex-1 border-b-2 border-gray-300 mb-1 mx-2"></div>
                      <span>{calculateHolderPercentage(holder)}</span>
                    </div>
                  ))
                ) : (
                  // Fallback to mock data if no database holders
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-end w-full">
                      <span>USER {String(i + 1).padStart(2, "0")}</span>
                      <div className="flex-1 border-b-2 border-gray-300 mb-1 mx-2"></div>
                      <span>0.00%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <HowItWorksModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
