// app/lib/data.js

export type MarketItem = {
  id: string;
  name: string;
  subname: string;
  price: string;
  change: string;
  isPositive: boolean;
  contract: string;
  holders: string;
};

export const MARKET_DATA = [
  {
    id: "cryptopunk-4213",
    name: "CryptoPunk",
    subname: "#4213",
    price: "$125.5K",
    change: "+12%",
    isPositive: true,
    contract: "0xb47...e55c",
    holders: "5.13%",
  },
  {
    id: "bored-ape-8821",
    name: "Bored Ape",
    subname: "#8821",
    price: "$85.2K",
    change: "-2.4%",
    isPositive: false,
    contract: "0xbc4...f13d",
    holders: "3.42%",
  },
  {
    id: "azuki-elemental",
    name: "Azuki",
    subname: "Elemental",
    price: "$12.4K",
    change: "+5.5%",
    isPositive: true,
    contract: "0xed5...3232",
    holders: "1.20%",
  },
  {
    id: "doodle-3321",
    name: "Doodle",
    subname: "#3321",
    price: "$8.9K",
    change: "+1.2%",
    isPositive: true,
    contract: "0xaa2...9981",
    holders: "8.10%",
  },
  {
    id: "moonbird-9912",
    name: "Moonbird",
    subname: "#9912",
    price: "$15.1K",
    change: "-0.5%",
    isPositive: false,
    contract: "0xcc1...2241",
    holders: "2.10%",
  },
  {
    id: "clone-x-1129",
    name: "Clone X",
    subname: "#1129",
    price: "$19.8K",
    change: "+8.8%",
    isPositive: true,
    contract: "0xdd9...1123",
    holders: "6.50%",
  },
];
