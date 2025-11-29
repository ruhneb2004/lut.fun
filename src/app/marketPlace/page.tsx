"use client";
import React, { useState } from "react";
import Link from "next/link";
import ItemCard from "@/components/ItemComp"; // Ensure this path matches your project
import { MARKET_DATA } from "../lib/data";
import CreateLotteryModal from "@/components/CreateLotteryModal";
import { truncateAddress, useWallet } from "@aptos-labs/wallet-adapter-react";

const Marketplace = () => {
  const { account } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col items-center">
      <CreateLotteryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

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
          {/* Search Bar (Static) */}
          <div className="w-full max-w-2xl mx-auto flex">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search..."
                className="w-full border-2 border-black border-r-0 py-3 pl-10 pr-4 font-mono focus:outline-none bg-gray-50 h-12"
              />
            </div>
            <button className="bg-[#baff73] border-2 border-black font-bold px-8 h-12 hover:bg-[#a3e660] transition-colors">
              Search
            </button>
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
              {MARKET_DATA.map((item) => (
                // 1. Wrap ItemCard in Link passing the ID
                <Link key={item.id} href={`/marketplace/${item.id}`} onClick={() => console.log("I am Benhur")}>
                  <ItemCard name={item.name} subname={item.subname} />
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Marketplace;
