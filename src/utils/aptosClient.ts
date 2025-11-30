import { NETWORK } from "@/constants";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

const aptos = new Aptos(
  new AptosConfig({
    network: NETWORK,
    clientConfig: { API_KEY: "AG-LA1Q5TNVBDBFBDJNTUOR2BTA8Y12KWI7Q" },
  }),
);

// Reuse same Aptos instance to utilize cookie based sticky routing
export function aptosClient() {
  return aptos;
}
