var HDWalletProvider = require("truffle-hdwallet-provider")
var mnemonic = process.env.MNEMONIC

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          "https://ropsten.infura.io/1bdb589f8c81498db03f2cf872600709"
        )
      },
      network_id: 3,
      gas: 3000000
    }
  }
}
