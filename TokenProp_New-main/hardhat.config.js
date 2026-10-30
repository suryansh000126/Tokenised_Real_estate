require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// 📚 LEARN: hardhat.config.js is the brain of your blockchain dev setup.
// It tells Hardhat WHICH networks exist, WHAT compiler version to use,
// and HOW to connect to them.

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // 📚 LEARN: "hardhat" is a LOCAL blockchain that runs on your machine.
    // It's instant, free, and resets every time you restart. Great for testing.
    hardhat: {
      chainId: 31337,
    },

    // 📚 LEARN: "localhost" is for when you run `npm run node` to start 
    // a persistent local blockchain at http://127.0.0.1:8545
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },

    // 📚 LEARN: "amoy" is Polygon's CURRENT test network (replaced Mumbai in 2024).
    // It works exactly like the real Polygon blockchain BUT tokens have no real value.
    // Perfect for learning and development! Chain ID 80002 is Amoy's identifier.
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },

  // 📚 LEARN: Polygonscan lets you verify your smart contract code publicly
  // so anyone can read it. This builds trust.
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
