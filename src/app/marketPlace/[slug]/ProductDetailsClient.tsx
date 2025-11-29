"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MARKET_DATA, MarketItem } from "@/app/lib/data";
import { truncateAddress, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import HowItWorksModal from "@/components/HowItWorksModal";
import { TOKENS, Token, fromOnChainAmount } from "@/utils/tokens";
import { usePoolDeposit } from "@/hooks/usePoolDeposit";
import { usePoolInfo, POOL_STATUS } from "@/hooks/usePoolInfo";
import { getAccountAPTBalance } from "@/view-functions/getAccountBalance";
import { getPoolByName, getChartData, getTopHolders, addChartData } from "@/lib/database";
import type { PoolCreate, ChartData, TopHolder } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";

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

  // Mock pool address - in production, this would come from your pool factory
  const poolAddress = "0x79bdc9ccd66851423ad43d18b391822a72200d52a2310e902bacf287df9355d1";

  // Get pool info
  const { data: poolInfo } = usePoolInfo(poolAddress);

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
  
  // Database state
  const [pool, setPool] = useState<PoolCreate | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topHolders, setTopHolders] = useState<TopHolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Compare using String() to ensure types match
  const product: MarketItem | undefined = MARKET_DATA.find((item) => String(item.id) === slug);

  // Fetch pool data from database
  useEffect(() => {
    const fetchPoolData = async () => {
      if (!product) return;
      
      setIsLoading(true);
      try {
        // Try to find pool by product name
        const poolData = await getPoolByName(product.name);
        
        if (poolData) {
          setPool(poolData);
          
          // Fetch chart data and top holders
          const [chartDataResult, topHoldersResult] = await Promise.all([
            getChartData(poolData.id),
            getTopHolders(poolData.id)
          ]);
          
          setChartData(chartDataResult);
          setTopHolders(topHoldersResult);
        }
      } catch (error) {
        console.error("[ProductDetails] Error fetching pool data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoolData();
  }, [product]);

  // Calculate holder percentage
  const calculateHolderPercentage = (holder: TopHolder): string => {
    if (!pool || pool.total === 0) return "0.00%";
    return ((holder.ticket_count / pool.total) * 100).toFixed(2) + "%";
  };

  // Debugging: Check your server terminal (not browser console) for this log
  console.log("Slug from URL:", slug);
  console.log("Found Product:", product);

  if (!product) {
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
            <Link href="/marketplace" className="font-mono font-bold text-sm underline hover:text-gray-600">
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
              <div className="w-32 h-32 bg-black shrink-0 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>

              <div className="flex-1 z-10 flex flex-col justify-between">
                <div>
                  {/* Dynamic Name and Subname */}
                  <h1 className="text-4xl font-black uppercase leading-none">{product?.name}</h1>
                  <h2 className="text-xl font-black text-gray-500 uppercase">{product?.subname}</h2>
                  <div className="flex items-center gap-2 mt-2 text-sm font-mono text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <span>&lt;username&gt; • 3d ago</span>
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 bg-gray-200 border border-black px-2 py-1 w-fit font-mono text-xs cursor-pointer hover:bg-gray-300">
                  <span>📑</span>
                  {/* Dynamic Contract */}
                  <span>{product?.contract}</span>
                </div>
              </div>

              <div className="z-10 flex flex-col gap-3 items-end justify-start">
                <button className="bg-[#baff73] text-black font-black text-xs uppercase px-6 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                  Share <span className="text-lg">T</span>
                </button>
                <button className="bg-[#ffbd59] text-black font-black text-xs uppercase px-6 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                  Save <span className="text-lg">★</span>
                </button>
              </div>
            </div>

            {/* CHART SECTION */}
            <div className="w-full border-2 border-black bg-white p-6 h-[500px] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-4">
                <p className="font-mono text-sm text-gray-600">
                  {pool ? `Pool Total: ${pool.total} tickets` : "Market cap"}
                </p>
                {/* Dynamic Price */}
                <h3 className="text-4xl font-black uppercase">{pool ? `$${pool.pool}` : product?.price}</h3>
                <p
                  className={`font-mono text-xs font-bold mt-1 ${product?.isPositive ? "text-green-600" : "text-red-600"}`}
                >
                  {product?.change} (24hr)
                </p>
                {pool && (
                  <p className="font-mono text-xs text-gray-500 mt-1">
                    Min: {pool.min} | Max: {pool.max}
                  </p>
                )}
              </div>

              <div className="flex-1 border border-gray-300 w-full relative bg-white overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                
                {/* Chart visualization from Supabase data */}
                {chartData.length > 0 && (
                  <div className="absolute inset-0 p-4 flex flex-col">
                    {/* Chart legend */}
                    <div className="flex gap-4 mb-2 text-xs font-mono">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-500"></span> Buy
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-red-500"></span> Sell
                      </span>
                    </div>
                    
                    {/* Bar chart showing buy/sell activity */}
                    <div className="flex-1 flex items-end gap-[2px]">
                      {chartData.slice(-50).map((data) => {
                        const maxAmount = Math.max(...chartData.map(d => d.amount), 10);
                        const heightPercent = (data.amount / maxAmount) * 100;
                        return (
                          <div
                            key={data.id}
                            className="flex-1 flex flex-col items-center justify-end group relative"
                          >
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                              <div className="font-bold capitalize">{data.action}</div>
                              <div>Amount: {data.amount}</div>
                              <div>{new Date(data.created_at || '').toLocaleString()}</div>
                            </div>
                            {/* Bar */}
                            <div
                              className={`w-full ${data.action === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} transition-colors cursor-pointer`}
                              style={{
                                height: `${Math.max(heightPercent, 5)}%`,
                                minHeight: '4px'
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* X-axis time labels */}
                    <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-500">
                      {chartData.length > 0 && (
                        <>
                          <span>{new Date(chartData[0]?.created_at || '').toLocaleDateString()}</span>
                          <span>{new Date(chartData[chartData.length - 1]?.created_at || '').toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {chartData.length === 0 && !isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-mono">
                    No trading activity yet
                  </div>
                )}
                
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-mono">
                    Loading chart data...
                  </div>
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
                      <span className="font-bold">{selectedToken.symbol}</span>
                      <span className="text-gray-500 text-sm">{selectedToken.name}</span>
                    </div>
                    <span className={`transition-transform ${isTokenDropdownOpen ? "rotate-180" : ""}`}>⌄</span>
                  </div>

                  {/* Dropdown Options */}
                  {isTokenDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {TOKENS.map((token) => (
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
                      ))}
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
                      {selectedToken.symbol}
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
                    <div className="flex justify-between">
                      <span>Total Pool:</span>
                      <span>{fromOnChainAmount(poolInfo.totalPoolAmount, 8)} APT</span>
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
                    const numAmount = parseFloat(amount);
                    if (isNaN(numAmount) || numAmount <= 0) {
                      toast({
                        title: "Error",
                        description: "Please enter a valid amount",
                        variant: "destructive",
                      });
                      return;
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
                        action: activeTab,
                        amount: numAmount,
                      });
                      
                      toast({
                        title: "Success!",
                        description: `${activeTab === "buy" ? "Buy" : "Sell"} action completed`,
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
                  disabled={isDepositing || !account || !amount}
                  className={`w-full border-2 border-black py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all ${
                    activeTab === "buy" ? "bg-[#57f287]" : "bg-[#ffbd59]"
                  } ${isDepositing || !account || !amount ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isDepositing ? "Processing..." : activeTab === "buy" ? "Buy Tickets" : "Sell Tickets"}
                </button>

                {!account && (
                  <p className="text-xs text-center text-red-500 font-bold">Connect wallet to {activeTab}</p>
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
                  Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="flex items-end w-full">
                      <span>USER {String(i + 1).padStart(2, "0")}</span>
                      <div className="flex-1 border-b-2 border-gray-300 mb-1 mx-2"></div>
                      <span>{product?.holders}</span>
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
