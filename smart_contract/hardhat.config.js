require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.7",
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/JfV2QgeRcEiIJXbeyC4CLS8e0Kk4vg3c',
      accounts: ['fe1df3ae9b63e72e3a7f2d116ca3b841896921845b1b4bc37241e13f75c7a650'] //metamask wallet private key
    }
  }
};
