require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
const dotenv = require('dotenv');
dotenv.config();

const defaultNetwork = 'localhost';

// 設定ファイルから読み込む
const {
  TEST_PRIVATE_KEY,
  POLYGONSCAN_API_KEY,
  INFURA_API_KEY,
  MUNBAI_API_KEY
} = process.env;

module.exports = {
  networks: {
    localhost: {
      url: 'http://localhost:8545',
    },
    /*
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [TEST_PRIVATE_KEY],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [TEST_PRIVATE_KEY],
    },
    */
    matic: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${MUNBAI_API_KEY}`,
      accounts: [TEST_PRIVATE_KEY],
    },
  },
  solidity: '0.8.0',
  etherscan: {
    // Polygonscan API Key
    apiKey: POLYGONSCAN_API_KEY,
  },
};
