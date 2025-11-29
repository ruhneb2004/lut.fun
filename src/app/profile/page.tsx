"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LucideCopy,
  LucideTrophy,
  LucideTicket,
  LucideHistory,
  LucideSettings,
  LucideLogOut,
  LucideWallet,
  LucideIcon,
  LucideLoader2,
} from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useUserDatabase } from "@/hooks/useUserDatabase";
import { useToast } from "@/components/ui/use-toast";
import type { LotteryHistory } from "@/types/supabase";

// --- TYPES & INTERFACES ---

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

interface ActivityRowProps {
  item: LotteryHistory;
}

// --- HELPER FUNCTIONS ---

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatJoinedDate(dateString: string | null): string {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
}

// --- SUB-COMPONENTS ---

const StatBox: React.FC<StatBoxProps> = ({ label, value, icon: Icon, color }) => (
  <div
    className={`bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start justify-between group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all`}
  >
    <div>
      <p className="font-mono text-sm text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-black">{value}</p>
    </div>
    <div className={`p-2 border-2 border-black ${color}`}>
      <Icon size={24} />
    </div>
  </div>
);

const ActivityRow: React.FC<ActivityRowProps> = ({ item }) => {
  const isPositive = item.status === "Won";
  const statusColors: Record<string, string> = {
    Won: "bg-[#baff73]",
    Active: "bg-[#ff7a50]",
    Lost: "bg-gray-100",
    Ended: "bg-gray-200",
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between border-2 border-black p-4 bg-white hover:bg-gray-50 transition-colors gap-4">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 border-2 border-black flex items-center justify-center shrink-0 ${statusColors[item.status || "Active"] || "bg-gray-100"}`}
        >
          {item.status === "Won" ? <LucideTrophy size={18} /> : <LucideTicket size={18} />}
        </div>
        <div>
          <h4 className="font-bold text-lg leading-none">{item.lottery_name}</h4>
          <span className="font-mono text-xs text-gray-500">
            {formatDate(item.played_at)} • {item.token_name || "APT"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-4">
        <span className={`font-mono font-bold text-lg ${isPositive ? "text-green-600" : "text-black"}`}>
          {item.count || 0} tickets
        </span>
        <div className="px-3 py-1 border-2 border-black text-xs font-bold uppercase tracking-wide bg-white">
          {item.status || "Active"}
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <LucideLoader2 className="w-8 h-8 animate-spin text-gray-500" />
  </div>
);

const NotConnected = () => {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
      <div className="text-center p-8 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-black uppercase mb-4">Wallet Not Connected</h2>
        <p className="font-mono mb-6">Please connect your wallet to view your profile.</p>
        <button
          onClick={() => router.push("/marketplace")}
          className="bg-[#ff7a50] border-2 border-black px-6 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          Go to Marketplace
        </button>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"history" | "created">("history");
  const { disconnect, connected } = useWallet();
  const { toast } = useToast();
  const router = useRouter();

  const {
    userDetails,
    lotteryHistory,
    isLoadingUser,
    isLoadingHistory,
    userAddress,
    isConnected,
  } = useUserDatabase();

  // Copy address to clipboard
  const copyAddress = async () => {
    if (!userAddress) return;
    try {
      await navigator.clipboard.writeText(userAddress);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy address.",
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    disconnect();
    router.push("/");
  };

  // Show not connected state
  if (!connected || !isConnected) {
    return <NotConnected />;
  }

  // Compute display values
  const displayName = userDetails?.name || truncateAddress(userAddress || "");
  const totalWinnings = userDetails?.total_win || 0;
  const activeTickets = userDetails?.active_tickets || 0;
  const gamesPlayed = userDetails?.game_played || 0;
  const winRate = userDetails?.win_rate || 0;
  const joinedAt = formatJoinedDate(userDetails?.joined_at || null);

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-black font-sans flex flex-col items-center">
      <div className="w-full max-w-7xl min-h-screen flex flex-col bg-white border-x-2 border-black">
        {/* --- HEADER --- */}
        <header className="flex justify-between items-stretch border-b-2 border-black h-20 sticky top-0 bg-white z-20">
          <div className="w-20 border-r-2 border-black relative overflow-hidden hidden md:block bg-[#baff73]">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_#000_1px,_transparent_1px)] [background-size:8px_8px]"></div>
          </div>
          <div className="flex-1 flex items-center justify-between px-8">
            <button onClick={() => router.push("/")} className="text-2xl font-black italic tracking-tighter hover:opacity-70 transition-opacity">
              LUT.FUN
            </button>
            <div className="flex gap-4">
              <button className="hidden md:flex items-center gap-2 font-bold hover:underline">
                <LucideWallet size={20} />
                <span>{truncateAddress(userAddress || "")}</span>
              </button>
              <div className="w-10 h-10 bg-black rounded-full border-2 border-black overflow-hidden relative">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userAddress}`} alt="avatar" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-12 flex flex-col gap-12">
          {/* --- TOP SECTION: PROFILE CARD --- */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: User Identity */}
            <div className="lg:w-1/3 flex flex-col gap-6">
              <div className="border-2 border-black p-6 bg-[#ff6b6b] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white border-l-2 border-b-2 border-black rounded-bl-full opacity-20"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-white border-4 border-black mb-4 overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userAddress}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {isLoadingUser ? (
                    <div className="h-12 flex items-center">
                      <LucideLoader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide bg-white px-2 border-2 border-black mb-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] break-all">
                      {displayName}
                    </h2>
                  )}
                  
                  <p className="font-mono text-sm font-bold mb-6">Joined: {joinedAt}</p>

                  {/* Wallet Pill */}
                  <button
                    onClick={copyAddress}
                    className="bg-white border-2 border-black px-4 py-2 flex items-center gap-3 w-full justify-between cursor-pointer active:scale-95 transition-transform hover:bg-gray-100"
                  >
                    <span className="font-mono text-sm truncate">{truncateAddress(userAddress || "")}</span>
                    <LucideCopy size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button className="border-2 border-black p-3 font-bold uppercase flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
                  <LucideSettings size={18} /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="border-2 border-black p-3 font-bold uppercase flex items-center justify-center gap-2 hover:bg-red-50 text-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
                >
                  <LucideLogOut size={18} /> Logout
                </button>
              </div>
            </div>

            {/* Right: Stats & Overview */}
            <div className="lg:w-2/3 flex flex-col gap-8">
              {/* Stats Grid */}
              {isLoadingUser ? (
                <LoadingSpinner />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatBox
                    label="Total Winnings"
                    value={`${totalWinnings} APT`}
                    icon={LucideTrophy}
                    color="bg-[#baff73]"
                  />
                  <StatBox
                    label="Active Tickets"
                    value={activeTickets}
                    icon={LucideTicket}
                    color="bg-[#ff7a50]"
                  />
                  <StatBox
                    label="Games Played"
                    value={gamesPlayed}
                    icon={LucideHistory}
                    color="bg-[#a2d2ff]"
                  />
                  <div className="bg-black text-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex flex-col justify-between group">
                    <div>
                      <p className="font-mono text-sm opacity-70 uppercase tracking-wider mb-1">Win Rate</p>
                      <p className="text-2xl md:text-3xl font-black text-[#baff73]">{winRate.toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-gray-800 h-2 mt-4 border border-gray-600">
                      <div className="h-full bg-[#baff73]" style={{ width: `${Math.min(winRate, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Banner / Ad Space */}
              <div className="flex-1 bg-[#f8f8f8] border-2 border-black p-6 flex flex-col justify-center items-start pattern-dots relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase mb-2">Ready for the next big win?</h3>
                  <p className="font-mono mb-4 max-w-md">
                    Check out the latest lotteries and try your luck!
                  </p>
                  <button
                    onClick={() => router.push("/marketplace")}
                    className="bg-[#baff73] border-2 border-black px-6 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    View Market
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* --- BOTTOM SECTION: HISTORY TABS --- */}
          <div className="flex flex-col">
            {/* Tabs */}
            <div className="flex border-b-2 border-black bg-gray-50">
              <button
                onClick={() => setActiveTab("history")}
                className={`px-8 py-4 font-black uppercase tracking-wider text-lg border-r-2 border-black transition-colors ${activeTab === "history" ? "bg-[#baff73]" : "hover:bg-gray-200"}`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab("created")}
                className={`px-8 py-4 font-black uppercase tracking-wider text-lg border-r-2 border-black transition-colors ${activeTab === "created" ? "bg-[#ff7a50]" : "hover:bg-gray-200"}`}
              >
                Created
              </button>
              <div className="flex-1"></div>
            </div>

            {/* Content Area */}
            <div className="border-2 border-t-0 border-black p-6 md:p-8 bg-white min-h-[400px]">
              {activeTab === "history" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl uppercase">Recent Activity</h3>
                  </div>

                  {isLoadingHistory ? (
                    <LoadingSpinner />
                  ) : lotteryHistory.length > 0 ? (
                    lotteryHistory.map((item, index) => (
                      <ActivityRow key={`${item.lottery_name}-${item.played_at}-${index}`} item={item} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-50">
                      <div className="w-24 h-24 border-2 border-black rounded-full flex items-center justify-center mb-4 bg-gray-100">
                        <LucideHistory size={48} />
                      </div>
                      <h3 className="font-black text-2xl uppercase">No History Yet</h3>
                      <p className="font-mono">Join a lottery to see your activity here.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 opacity-50">
                  <div className="w-24 h-24 border-2 border-black rounded-full flex items-center justify-center mb-4 bg-gray-100">
                    <LucideTicket size={48} />
                  </div>
                  <h3 className="font-black text-2xl uppercase">No Lotteries Created</h3>
                  <p className="font-mono">You haven't hosted any games yet.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
