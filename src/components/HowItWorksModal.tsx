import React from "react";

const HowItWorksModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop with dimming effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#f5f5f5] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#a855f7] border-b-2 border-black p-4 flex justify-between items-center">
          <h2 className="font-black text-2xl uppercase tracking-wide">HOW IT WORKS</h2>
          <button onClick={onClose} className="hover:bg-black/10 p-1 rounded transition-colors">
            {/* Simple SVG X Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 flex flex-col gap-6">
          {/* Step 1 */}
          <div className="flex gap-6 items-start">
            <span className="font-black text-xl uppercase whitespace-nowrap w-20">STEP 1</span>
            <p className="font-mono text-sm leading-relaxed text-gray-800">Lotrys go live at 9PM IST</p>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6 items-start">
            <span className="font-black text-xl uppercase whitespace-nowrap w-20">STEP 2</span>
            <p className="font-mono text-sm leading-relaxed text-gray-800">
              Players can freely trade Lotry tokens on a bonding curve until draw
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6 items-start">
            <span className="font-black text-xl uppercase whitespace-nowrap w-20">STEP 3</span>
            <p className="font-mono text-sm leading-relaxed text-gray-800">
              At draw, the Lottery Pool is distributed to the winner, and LP is pulled and distributed to holders based
              on their token holdings
            </p>
          </div>

          {/* Red Warning Text */}
          <div className="mt-4 text-center">
            <p className="text-[#ff0000] font-bold italic text-sm px-4 leading-tight">
              Tickets can be traded until draw. To increase your chances of winning accumulate tokens on dips.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mt-2">
            <button
              onClick={onClose}
              className="bg-[#baff73] text-black font-black border-2 border-black py-3 px-12 text-lg uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              LET'S GO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;
