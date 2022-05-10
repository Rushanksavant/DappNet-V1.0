require("@nomiclabs/hardhat-waffle");

const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "hardhat",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.projectid}`,
      accounts: [process.env.KEY]
    },
  }
};
