const Registry = artifacts.require("Registry")
module.exports = function(deployer) {
  deployer.deploy(Registry)
}
