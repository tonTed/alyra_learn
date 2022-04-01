const Voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');

function expect_equal_BN(arg1, arg2){
	expect(new BN(arg1)).to.be.bignumber.equal(new BN(arg2));
}

const mess = {
	onlyOwner: "caller is not the owner",
	onlyVoters: "ou're not a voter",
}

contract('Voting', accounts => {
	const admin = accounts[0];
	const voter1 = accounts[1];
	const voter2 = accounts[2];
	const voter3 = accounts[3];
	const voter4 = accounts[4];
	const voter5 = accounts[5];
	const noVoter = accounts[8];
	const unknow = accounts[9];
	let VI;
	
	// VI = VotingInstance
	before(async () => {
		VI = await Voting.new({from: admin});
	})
	context("Check visibilities and accessibilities", () => {
		context("Visibilities of functions and variables", () => {
			describe("Public and External", () => {
				it("winningProposalID",	() => assert.isDefined(VI.winningProposalID));
				it("workflowsStatus",	() => assert.isDefined(VI.workflowStatus));
				it("proposalsArray",	() => assert.isDefined(VI.proposalsArray));
				it("getVoter",			() => assert.isDefined(VI.getVoter));
				it("getOneProposal",	() => assert.isDefined(VI.getOneProposal));
				it("getWinner",			() => assert.isDefined(VI.getWinner));
				it("addVoter",			() => assert.isDefined(VI.addVoter));
				it("addProposal",		() => assert.isDefined(VI.addProposal));
				it("setVote",			() => assert.isDefined(VI.setVote));
				
				it("startProposalsRegistering",	() => assert.isDefined(VI.startProposalsRegistering));
				it("endProposalsRegistering",	() => assert.isDefined(VI.endProposalsRegistering));
				it("startVotingSession",		() => assert.isDefined(VI.startVotingSession));
				it("endVotingSession",			() => assert.isDefined(VI.endVotingSession));
				it("tallyVotesDraw",			() => assert.isDefined(VI.tallyVotesDraw));
			})
			describe("Private and Internal", () => {
				it("winningProposalsID",	() => assert.isUndefined(VI.winningProposalsID));
				it("winningProposals",		() => assert.isUndefined(VI.winningProposals));
				it("voters",				() => assert.isUndefined(VI.voters));
			})
		})
		context("Modifiers accessibility in functions", () => {
			describe("onlyOwner reverting if not owner", () => {
				it("addVoter(voter1, {from: unknow})", 			async () => 
				await expectRevert(VI.addVoter(voter1, {from: unknow}),
				mess.onlyOwner));
				it("startProposalsRegistering({from: unknow})",	async () =>
				await expectRevert(VI.startProposalsRegistering({from: unknow}),
				mess.onlyOwner));
				it("endProposalsRegistering({from: unknow})",	async () =>
				await expectRevert(VI.endProposalsRegistering({from: unknow}),
				mess.onlyOwner));
				it("startVotingSession({from: unknow})",		async () =>
				await expectRevert(VI.startVotingSession({from: unknow}),
				mess.onlyOwner));
				it("endVotingSession({from: unknow})",			async () =>
				await expectRevert(VI.endVotingSession({from: unknow}),
				mess.onlyOwner));
				it("tallyVotesDraw({from: unknow})",			async () =>
				await expectRevert(VI.tallyVotesDraw({from: unknow}),
				mess.onlyOwner));
			})
			describe("onlyVoters reverting if not voters", () => {
				it("getVoter(voter1, {from: admin})",		async () =>
				await expectRevert(VI.getVoter(voter1, {from: admin}),
				mess.onlyVoters));
				it("getOneProposal(0, {from: noVoter})",	async () =>
				await expectRevert(VI.getOneProposal(0, {from: noVoter}),
				mess.onlyVoters));
				it("addProposal('desc', {from: admin})",	async () =>
				await expectRevert(VI.addProposal("desc", {from: admin}),
				mess.onlyVoters));
				it("setVote(0, {from: noVoter})",			async () =>
				await expectRevert(VI.setVote(0, {from: noVoter}),
				mess.onlyVoters));
			})
		})
	})
		// expect(await VI.workflowStatus.call({from: unknow}), 0);
		// const result = await VI.workflowStatus({from: unknow});
		// console.log(result);
		// expect(await VI.workflowStatus({from: unknow})).not.undefined;
		// expect(VI.workflowStatus).not.undefined;
			// expect(await VI.winningProposalsID.call({from: unknow})).to.throw(TypeError);
		// describe("addVoter()", () =>{
		// 	it("should be revert when the owner does not make the transaction", async () => {
		// 		await expectRevert(VI.addVoter.call(voter1, {from: unknow}), "caller is not the owner")
		// 	})
		// })
	context("Registering Voters", () => {
		// it("should be the status 0 (RegisteringVoters)", async () => {
		// 	expect_equal_BN(await VI.workflowStatus.call({from: admin}), 0);
		// })
		// describe("addVoter()", () =>{
		// 	it("should be revert when the owner does not make the transaction", async () => {
		// 		await expectRevert(VI.addVoter.call(voter1, {from: unknow}), "caller is not the owner")
		// 	})
		// })
	})
})