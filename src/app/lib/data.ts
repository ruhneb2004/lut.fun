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
  image: string;
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
    image: "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&w=384",
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
    image: "https://i.seadn.io/gae/i5dYZRkVCUK97bfprQ3WXyrT9BnLSZtVKGJlKQ919uaUB0sxbngVCioaiyu9r6snqfi2aaTyIvv6DHm4m2R3y7hMajbsv14pSZK8mhs?auto=format&w=384",
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
    image: "https://i.seadn.io/gcs/files/1450e68c77e36ca074656d6bb8edf810.png?auto=format&w=384",
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
    image: "https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?auto=format&w=384",
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
    image: "https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?auto=format&w=384",
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
    image: "https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofDx6aHklOiy4amhFuWUa0JaR6It49AH8tlnYS386Q0TW_-Lmedn0UET_ko1a3CbJGeu5iHMg?auto=format&w=384",
  },
];
