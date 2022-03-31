const Voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

function expect_int(arg1, arg2){
	expect(new BN(arg1)).to.be.bignumber.equal(new BN(arg2));
}

contract('Voting', accounts => {
	const admin = accounts[0];
	const voter1 = accounts[1];
	const voter2 = accounts[2];
	const voter3 = accounts[3];
	const voter4 = accounts[4];
	const voter5 = accounts[5];

	it("Bagin first test is good!", () => {
		expect(true).true;
	})
})