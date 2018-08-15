// const Registry = artifacts.require("Registry")
const ZincAccessor = artifacts.require("ZincAccessor")

module.exports = function(deployer) {
  deployer.deploy(ZincAccessor)
}
