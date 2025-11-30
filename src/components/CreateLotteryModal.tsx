"use client";

import React, { useState } from "react";
import { createPool } from "@/lib/database";
import { useToast } from "@/components/ui/use-toast";
import { useCreatePool } from "@/hooks/useCreatePool";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface CreateLotteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPoolCreated?: () => void;
}

const CreateLotteryModal: React.FC<CreateLotteryModalProps> = ({ isOpen, onClose, onPoolCreated }) => {
  const { toast } = useToast();
  const { account } = useWallet();
  const { createPool: createPoolOnChain, isLoading: isCreatingOnChain } = useCreatePool();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    min: "",
    max: "",
    poolToken: "",
    poolAmount: "",
    imageUrl: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    // Check wallet connection first
    if (!account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a pool",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a lottery name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.min || !formData.max) {
      toast({
        title: "Validation Error",
        description: "Please enter minimum and maximum entry values",
        variant: "destructive",
      });
      return;
    }

    if (!formData.poolAmount) {
      toast({
        title: "Validation Error",
        description: "Please select a pool amount",
        variant: "destructive",
      });
      return;
    }

    const minEntry = parseFloat(formData.min);
    const maxEntry = parseFloat(formData.max);
    const poolAmount = parseFloat(formData.poolAmount);

    if (minEntry <= 0 || maxEntry <= 0 || poolAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "All values must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (minEntry > maxEntry) {
      toast({
        title: "Validation Error",
        description: "Minimum entry cannot be greater than maximum entry",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create pool on-chain first
      const onChainResult = await createPoolOnChain({
        name: formData.name.trim(),
        outcomes: ["YES", "NO"], // Default outcomes for lottery
        minEntry: minEntry,
        maxEntry: maxEntry,
      });

      // Only proceed to database if on-chain creation was successful
      if (!onChainResult || !onChainResult.success) {
        // Toast is already shown by the hook
        setIsLoading(false);
        return;
      }

      // Step 2: Create pool in database after successful on-chain creation
      const pool = await createPool({
        name: formData.name.trim(),
        min: minEntry,
        max: maxEntry,
        pool: poolAmount,
        total: 0, // Initial total is 0
        pool_address: onChainResult.poolAddress || null, // Save the on-chain pool address
        image_url: formData.imageUrl.trim() || null, // Save the image URL
      });

      if (pool) {
        toast({
          title: "Pool Created!",
          description: `Pool "${pool.name}" created successfully on-chain and saved to database`,
        });

        // Reset form
        setFormData({
          name: "",
          min: "",
          max: "",
          poolToken: "",
          poolAmount: "",
          imageUrl: "",
        });

        // Callback for parent component
        onPoolCreated?.();

        // Close modal
        onClose();
      } else {
        // On-chain succeeded but database failed
        toast({
          title: "Partial Success",
          description: "Pool created on-chain but failed to save to database. Transaction hash: " + onChainResult.hash,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[CreateLotteryModal] Error creating pool:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="flex-1 bg-white border-2 border-black p-3 font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/20"
              disabled={isLoading}
            />
          </div>

          {/* Image URL */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="text-xl font-bold font-mono min-w-[200px] text-black">Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/image.png"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange("imageUrl", e.target.value)}
              className="flex-1 bg-white border-2 border-black p-3 font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/20"
              disabled={isLoading}
            />
          </div>

          {/* Minimum Entry */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="text-xl font-bold font-mono min-w-[200px] text-black">Minimum Entry</label>
            <div className="w-32">
              <input
                type="number"
                placeholder="-0-"
                value={formData.min}
                onChange={(e) => handleInputChange("min", e.target.value)}
                className="w-full bg-white border-2 border-black p-3 text-center font-mono focus:outline-none"
                disabled={isLoading}
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
                value={formData.max}
                onChange={(e) => handleInputChange("max", e.target.value)}
                className="w-full bg-white border-2 border-black p-3 text-center font-mono focus:outline-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Pool */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="text-xl font-bold font-mono min-w-[200px] text-black">Pool</label>
            <div className="flex flex-1 gap-4">
              <div className="relative w-full">
                <select
                  className="w-full appearance-none bg-white border-2 border-black p-3 pr-8 font-mono focus:outline-none cursor-pointer"
                  value={formData.poolToken}
                  onChange={(e) => handleInputChange("poolToken", e.target.value)}
                  disabled={isLoading}
                >
                  <option value="" disabled></option>
                  <option value="usdc">APT</option>
                  <option value="eth">USDC</option>
                  <option value="sol">USDT</option>
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
                <select
                  className="w-full appearance-none bg-white border-2 border-black p-3 pr-8 font-mono focus:outline-none cursor-pointer"
                  value={formData.poolAmount}
                  onChange={(e) => handleInputChange("poolAmount", e.target.value)}
                  disabled={isLoading}
                >
                  <option value="" disabled></option>
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
            <button
              onClick={handleCreate}
              disabled={isLoading || isCreatingOnChain || !account}
              className={`bg-[#baff73] border-2 border-black px-16 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all ${isLoading || isCreatingOnChain || !account ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="text-xl font-black uppercase tracking-widest text-black">
                {!account
                  ? "CONNECT WALLET"
                  : isCreatingOnChain
                    ? "CREATING ON-CHAIN..."
                    : isLoading
                      ? "SAVING..."
                      : "CREATE"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLotteryModal;
