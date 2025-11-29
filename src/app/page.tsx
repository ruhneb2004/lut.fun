"use client";
import React, { useState, useEffect } from "react";
import HowItWorksModal from "@/components/HowItWorksModal";
import { WalletSelector } from "@/components/WalletSelector";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from "next/navigation";

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Get connection state and router
  const { connected, isLoading } = useWallet();
  const router = useRouter();

  // 2. Effect to redirect on successful connection
  useEffect(() => {
    if (connected && !isLoading) {
      router.push("/marketPlace");
    }
  }, [connected, isLoading, router]);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col items-center">
      <div className="w-full max-w-7xl border-x-2 border-black min-h-screen flex flex-col relative bg-white">
        {/* --- HEADER --- */}
        <header className="flex justify-between items-stretch border-b-2 border-black h-20">
          <div className="w-20 border-r-2 border-black relative overflow-hidden hidden md:block">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:10px_10px] [transform:scale(1.5)_rotate(15deg)]"></div>
            <div className="absolute inset-0 bg-white/20 rounded-full border border-black/10 -m-2"></div>
          </div>

          <div className="flex-1 flex items-center justify-end px-8 gap-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="font-mono font-bold hover:underline bg-transparent border-none cursor-pointer"
            >
              How it works
            </button>

            {/* Note: The redirect logic handles the navigation, so we just show the selector here */}
            <div className="bg-[#ff7a50] text-black font-bold border-2 border-black py-3 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              <WalletSelector />
            </div>
          </div>

          <div className="w-20 border-l-2 border-black relative overflow-hidden hidden md:block">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:14px_14px]"></div>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 gap-16">
          <div className="text-center w-full max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">TOTAL POOL</h1>
            <div className="flex items-center justify-center gap-4 w-full">
              <div className="h-[2px] bg-gray-600 flex-1"></div>
              <span className="text-4xl md:text-6xl font-black text-gray-600 tracking-tight">$25,000</span>
              <div className="h-[2px] bg-gray-600 flex-1"></div>
            </div>
          </div>

          <div className="w-full max-w-3xl bg-[#baff73] border-2 border-black p-12 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(20deg)] origin-top"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center gap-8">
              <h2 className="text-2xl md:text-3xl font-black uppercase max-w-lg leading-tight">
                Deposit USDC to win prizes, rewards, and contribute to a good cause
              </h2>
              {/* Wallet Selector in the Hero Section */}
              <div className="bg-white text-black font-black border-2 border-black py-4 px-12 text-lg uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <WalletSelector />
              </div>
            </div>
          </div>
        </main>

        {/* --- FOOTER MARQUEE --- */}
        <footer className="h-16 bg-[#ff7a50] border-t-2 border-black flex items-center overflow-hidden whitespace-nowrap relative">
          <div className="animate-marquee flex gap-8 items-center font-mono font-bold text-white text-lg">
            {Array(10)
              .fill("")
              .map((_, i) => (
                <React.Fragment key={`marquee-1-${i}`}>
                  <span>16.29 won 117 days ago</span>
                  <span className="text-black">♦</span>
                </React.Fragment>
              ))}
          </div>
          <div className="animate-marquee flex gap-8 items-center font-mono font-bold text-white text-lg absolute top-0 left-full h-full pl-8">
            {Array(10)
              .fill("")
              .map((_, i) => (
                <React.Fragment key={`marquee-2-${i}`}>
                  <span>16.29 won 117 days ago</span>
                  <span className="text-black">♦</span>
                </React.Fragment>
              ))}
          </div>
        </footer>

        {/* Modal Component */}
        <HowItWorksModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
