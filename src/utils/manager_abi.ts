// Manager ABI for SafeBet lottery manager operations
// This is the ABI for the safebet::manager module

export const MANAGER_ABI = {
  address:
    process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0xb339b0b5ea892c5e3f24a0a62e22319d17d0ec6f7dff905314c6e5e9755b88ae",
  name: "manager",
  friends: [],
  exposed_functions: [
    {
      name: "initialize",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer"],
      return: [],
    },
    {
      name: "lock_and_stake",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address"],
      return: [],
    },
    {
      name: "resolve_and_distribute",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "0x1::string::String"],
      return: [],
    },
    {
      name: "auto_resolve",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address"],
      return: [],
    },
    {
      name: "get_manager_config",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["address", "address", "address"],
    },
  ],
  structs: [],
} as const;
