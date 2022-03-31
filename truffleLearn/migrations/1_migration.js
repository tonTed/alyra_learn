const Grade = artifacts.require("Grade");
const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  deployer.deploy(Voting);
  // deployer.deploy(Grade);
};
