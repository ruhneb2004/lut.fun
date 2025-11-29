import React from "react";

interface CreateLotteryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateLotteryModal: React.FC<CreateLotteryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Overlay with subtle blur
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Modal Container - preventing click propagation */}
      <div
        className="w-full max-w-2xl bg-[#f8f8f8] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#ff7a50] border-b-4 border-black p-6">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wide text-black m-0">CREATE NEW LOTTERY</h2>
        </div>

        {/* Form Content */}
        <div className="p-8 md:p-12 flex flex-col gap-8">
          {/* Lottery Name */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="text-xl font-bold font-mono min-w-[200px] text-black">Lottery Name</label>
            <input
              type="text"
              placeholder="Enter Lottery name"
              className="flex-1 bg-white border-2 border-black p-3 font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          {/* Minimum Entry */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="text-xl font-bold font-mono min-w-[200px] text-black">Minimum Entry</label>
            <div className="w-32">
              <input
                type="number"
                placeholder="-0-"
                className="w-full bg-white border-2 border-black p-3 text-center font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Maximum Entry */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="text-xl font-bold font-mono min-w-[200px] text-black">Maximum Entry</label>
            <div className="w-32">
              <input
                type="number"
                placeholder="-0-"
                className="w-full bg-white border-2 border-black p-3 text-center font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Pool */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="text-xl font-bold font-mono min-w-[200px] text-black">Pool</label>
            <div className="flex flex-1 gap-4">
              <div className="relative w-full">
                <select className="w-full appearance-none bg-white border-2 border-black p-3 pr-8 font-mono focus:outline-none cursor-pointer">
                  <option value="" disabled selected></option>
                  <option value="usdc">USDC</option>
                  <option value="eth">ETH</option>
                  <option value="sol">SOL</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              <div className="relative w-full">
                <select className="w-full appearance-none bg-white border-2 border-black p-3 pr-8 font-mono focus:outline-none cursor-pointer">
                  <option value="" disabled selected></option>
                  <option value="100">100</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-center mt-8">
            <button className="bg-[#baff73] border-2 border-black px-16 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
              <span className="text-xl font-black uppercase tracking-widest text-black">CREATE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLotteryModal;
