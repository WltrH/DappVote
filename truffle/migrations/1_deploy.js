const voting = artifacts.require("voting");

module.exports = async (deployer) =>{
  deployer.deploy(voting);
};
