"use client";
import React, { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MARKET_DATA, MarketItem } from "@/app/lib/data";
import { truncateAddress, useWallet } from "@aptos-labs/wallet-adapter-react";
import HowItWorksModal from "@/components/HowItWorksModal";

export default function ProductDetailsClient({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { account } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compare using String() to ensure types match
  const product: MarketItem | undefined = MARKET_DATA.find((item) => String(item.id) === slug);

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
                <p className="font-mono text-sm text-gray-600">Market cap</p>
                {/* Dynamic Price */}
                <h3 className="text-4xl font-black uppercase">{product?.price}</h3>
                <p
                  className={`font-mono text-xs font-bold mt-1 ${product?.isPositive ? "text-green-600" : "text-red-600"}`}
                >
                  {product?.change} (24hr)
                </p>
              </div>

              <div className="flex-1 border border-gray-300 w-full relative bg-white">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              </div>
            </div>
          </div>

          {/* === RIGHT COLUMN === */}
          <div className="w-full lg:w-80 flex flex-col gap-8">
            <div className="border-2 border-black bg-gray-50 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex gap-4 mb-6 justify-center">
                <button className="flex-1 bg-[#57f287] border-2 border-black py-2 font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all">
                  Buy
                </button>
                <button className="flex-1 bg-[#ffbd59] border-2 border-black py-2 font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all">
                  Sell
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="border-2 border-black bg-white h-10 w-full flex items-center px-2 cursor-pointer hover:bg-gray-100">
                    <span className="ml-auto">⌄</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="border-2 border-black bg-white h-10 w-full flex items-center px-2 cursor-pointer hover:bg-gray-100">
                    <span className="ml-auto">⌄</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-black bg-gray-50 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black uppercase text-xl mb-6">TOP HOLDERS</h3>
              <div className="flex flex-col gap-2 font-black text-xs uppercase">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="flex items-end w-full">
                    <span>USER {String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1 border-b-2 border-gray-300 mb-1 mx-2"></div>
                    {/* Dynamic Holders Stat */}
                    <span>{product?.holders}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      <HowItWorksModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
