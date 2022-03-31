const Grade = artifacts.require("Grade");

module.exports = function (deployer) {
  deployer.deploy(Grade);
};
