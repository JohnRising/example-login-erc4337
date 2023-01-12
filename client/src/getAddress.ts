import { getSimpleAccount } from "./getSimpleAccount";
import { ethers } from "ethers";
const config = require("./config.json");

// Create a counterfactual address
export function getAddress(potentialWallet: ethers.Wallet) {
  async function main() {
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const accountAPI = getSimpleAccount(
      provider,
      potentialWallet.privateKey,
      config.entryPoint,
      config.simpleAccountFactory
    );
    const address = await accountAPI.getCounterFactualAddress();
    console.log(`SimpleAccount address: ${address}`);
    return address;
  }

  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default getAddress;
