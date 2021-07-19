require('dotenv').config();
require("@nomiclabs/hardhat-waffle");

// Go to https://infura.io/ and create a new project
// Replace this with your Infura project ID
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const ROPSTEN_PRIVATE_KEY = process.env.PRIVATE_KEY;


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [{
      version: "0.8.4", settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
    }, {
      version: "0.7.3", settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
    }, {
      version: "0.5.7", settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
    }, {
      version: "0.5.0", settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
    }],
  },
  networks: {
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`]
    }
  }
};
