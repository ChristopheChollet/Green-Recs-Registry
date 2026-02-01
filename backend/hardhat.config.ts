import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "dotenv/config";

function sanitizePrivateKey(pk?: string) {
  const s = (pk ?? "").trim();
  if (!s) return undefined;
  return s.startsWith("0x") ? s : `0x${s}`;
}

export default defineConfig({
  solidity: "0.8.28",
  plugins: [hardhatToolboxMochaEthersPlugin],
  networks: {
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: (() => {
        const pk = sanitizePrivateKey(process.env.SEPOLIA_PRIVATE_KEY);
        return pk ? [pk] : [];
      })(),
    },
  },
});