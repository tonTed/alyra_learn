const Voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');

function expect_equal_BN(arg1, arg2){
	expect(new BN(arg1)).to.be.bignumber.equal(new BN(arg2));
}

const revMess = {
	onlyOwner: "caller is not the owner",
	onlyVoters: "ou're not a voter",
	emptyString: "Vous ne pouvez pas ne rien proposer",
}

contract.only('Voting', accounts => {
	const admin = accounts[0];
	const voters = [
		{
			at: accounts[1],
			prop: "prop1",
			vote: 2,
		},
		{
			at: accounts[2],
			prop: "prop2",
			vote: 0,
		},
		{
			at: accounts[3],
			prop: "prop3",
			vote: 2,
		},
		{
			at: accounts[4],
			prop: "prop4",
			vote: 1,
		},
		{
			at: accounts[5],
			prop: "",
			vote: 8,
		},
	]
	const noVoter = accounts[8];
	const unknow = accounts[9];
	let VI;
	const status = [{
			name: 'RegisteringVoters',},
		{
			name: 'ProposalsRegistrationStarted',
			fn: () => {return VI.startProposalsRegistering({from: admin})},
			revMess:' Registering proposals cant be started now',},
		{
			name: 'ProposalsRegistrationEnded',
			fn: () => VI.endProposalsRegistering({from: admin}),
			revMess: 'Registering proposals havent started yet',},
		{
			name: 'VotingSessionStarted',
			fn: () => VI.startVotingSession({from: admin}),
			revMess: 'Registering proposals phase is not finished',},
		{
			name: 'VotingSessionEnded',
			fn: () => VI.endVotingSession({from: admin}),
			revMess: 'Voting session havent started yet',},
		{
			name: 'VotesTallied',
			fn: () => VI.tallyVotesDraw({from: admin}),
			revMess: "Current status is not voting session ended",}
	]

	const funcs = [{
			name: 'addVoter',
			status: 0,
			fn: () => VI.addVoter(unknow, {from: admin}),
			revMess: 'Voters registration is not open yet',},
		{
			name: 'addProposal',
			status: 1,
			fn: () => VI.addProposal("unknow", {from: voters[0]}),
			revMess: 'Proposals are not allowed yet',},
		// {
		// 	name: 'setVote',
		// 	status: 3,
		// 	fn: () => VI.setVote(1, {from: voters[0]}),
		// 	revMess: 'Voting session havent started yet',},
		{
			name: 'getWinner',
			status: 5,
			fn: () => VI.getWinner({from: unknow}),
			revMess: 'Votes are not tallied yet',},
	]

	function tryFunctions(current_status){
		for(let id_func = 0; id_func < funcs.length; id_func++){
			if(funcs[id_func].status != current_status){
				it(`${funcs[id_func].name}(...) soulb be revert with message '${funcs[id_func].revMess}'`, async () =>
					await expectRevert(funcs[id_func].fn(), funcs[id_func].revMess));
			}
		}
	}
	
	// VI = VotingInstance
	context("Check visibilities and accessibilities", () => {
		before(async () => {
			VI = await Voting.new({from: admin});
		})
		context("Visibilities of functions and variables", () => {
			describe("Public and External", () => {
				it("winningProposalID",	() => assert.isDefined(VI.winningProposalID));
				it("workflowsStatus",		() => assert.isDefined(VI.workflowStatus));
				it("proposalsArray",		() => assert.isDefined(VI.proposalsArray));
				it("getVoter",					() => assert.isDefined(VI.getVoter));
				it("getOneProposal",		() => assert.isDefined(VI.getOneProposal));
				it("getWinner",					() => assert.isDefined(VI.getWinner));
				it("addVoter",					() => assert.isDefined(VI.addVoter));
				it("addProposal",				() => assert.isDefined(VI.addProposal));
				it("setVote",						() => assert.isDefined(VI.setVote));
				
				it("startProposalsRegistering",	() => assert.isDefined(VI.startProposalsRegistering));
				it("endProposalsRegistering",		() => assert.isDefined(VI.endProposalsRegistering));
				it("startVotingSession",				() => assert.isDefined(VI.startVotingSession));
				it("endVotingSession",					() => assert.isDefined(VI.endVotingSession));
				it("tallyVotesDraw",						() => assert.isDefined(VI.tallyVotesDraw));
			})
			describe("Private and Internal", () => {
				it("winningProposalsID",	() => assert.isUndefined(VI.winningProposalsID));
				it("winningProposals",		() => assert.isUndefined(VI.winningProposals));
				it("voters",							() => assert.isUndefined(VI.voters));
			})
		})
		context("Modifiers accessibility in functions", () => {
			describe("onlyOwner reverting if not owner", () => {
				it("addVoter(voters[0], {from: unknow})", 			async () => 
					await expectRevert(VI.addVoter(voters[0].at, {from: unknow}), revMess.onlyOwner));
				it("startProposalsRegistering({from: unknow})",	async () =>
					await expectRevert(VI.startProposalsRegistering({from: unknow}),
				revMess.onlyOwner));
				it("endProposalsRegistering({from: unknow})",		async () =>
					await expectRevert(VI.endProposalsRegistering({from: unknow}),
				revMess.onlyOwner));
				it("startVotingSession({from: unknow})",	async () =>
					await expectRevert(VI.startVotingSession({from: unknow}),
				revMess.onlyOwner));
				it("endVotingSession({from: unknow})",		async () =>
					await expectRevert(VI.endVotingSession({from: unknow}),
				revMess.onlyOwner));
				it("tallyVotesDraw({from: unknow})",			async () =>
					await expectRevert(VI.tallyVotesDraw({from: unknow}),
				revMess.onlyOwner));
			})
			describe("onlyVoters reverting if not voters", () => {
				it("getVoter(voters[0], {from: admin})",	async () =>
					await expectRevert(VI.getVoter(voters[0].at, {from: admin}), revMess.onlyVoters));
				it("getOneProposal(0, {from: noVoter})",	async () =>
					await expectRevert(VI.getOneProposal(0, {from: noVoter}), revMess.onlyVoters));
				it("addProposal('desc', {from: admin})",	async () =>
					await expectRevert(VI.addProposal("desc", {from: admin}), revMess.onlyVoters));
				it("setVote(0, {from: noVoter})",					async () =>
					await expectRevert(VI.setVote(0, {from: noVoter}), revMess.onlyVoters));
			})
		})
	})
	context("Testing workflowStatus chagement", () => {
		before(async () => {
			VI = await Voting.new({from: admin});
		})
		for (let status_tested = 0; status_tested < status.length; status_tested++){
			describe(`Current status : ${status[status_tested].name}`, () => {
				it(`Current status shoulb be ${status_tested}`, 	async () =>
					expect_equal_BN(await VI.workflowStatus({from: admin}), status_tested));
				for (let j = 1; j < status.length; j++){
					if (j != status_tested + 1){
						it(`Revert when trying change status to ${status[j].name}`,	async () =>
							await expectRevert(status[j].fn(),
							status[j].revMess));
					}
				}
				if (status_tested < status.length - 1){
					it(`event when the status change to ${status[1].name}`,	async () =>
						expectEvent(await status[status_tested + 1].fn(), 'WorkflowStatusChange',
						{previousStatus: new BN(status_tested), newStatus: new BN(status_tested + 1)}));
					it(`New status shoulb be ${status_tested + 1}`, 		async () =>
						expect_equal_BN(await VI.workflowStatus({from: admin}), status_tested + 1));
				}
			})
		}
	})
	context("Testing functions while complete sessions", () => {
		before(async () => {
			VI = await Voting.new({from: admin});
		})
		context("While RegisteringVoters session:", () =>{
			describe("adding voters {from: admin}:", () => {
				for (let voter_id = 0; voter_id < voters.length; voter_id++){
					it(`addVoter(${voters[voter_id].at}), event VoterRegistered shoulb be emit ${voters[voter_id].at}`,
						async () => expectEvent(await VI.addVoter(voters[voter_id].at, {from: admin}), 'VoterRegistered', {voterAddress: voters[voter_id].at}))
				}
			})
			describe(`getting voters {from: ${voters[0].at}}:`, () =>{
				for (let voter_id = 0; voter_id < voters.length; voter_id++){
					it(`getVoter(${voters[voter_id].at}, {from: voters[0]}).isRegistered should be return true`,
						async () => expect((await VI.getVoter(voters[voter_id].at,
						{from: voters[0].at})).isRegistered).true)
				}
				it(`getVoter(${unknow}, {from: voters[0]}).isRegistered should be return false`, 
					async () => expect((await VI.getVoter(unknow, {from: voters[0].at})).isRegistered).false)
			})
		})
		context(`ProposalsRegistrationStarted`, () =>{
			it(`changing status to ProposalsRegistrationStarted with startProposalsRegistering({from: admin}) event should be (0, 1)`,
				async () => expectEvent(await VI.startProposalsRegistering({from: admin}), 'WorkflowStatusChange',
				{previousStatus: new BN(0), newStatus: new BN(1)}))
			describe(`adding proposals`, () =>{		
				for (let voter_id = 0; voter_id < voters.length - 1; voter_id++){
					it(`addProposal(${voters[voter_id].prop}, {from: ${voters[voter_id].at}}, event ProposalRegistered shoulb be emit ${voter_id}`,
						async () => expectEvent(await VI.addProposal(voters[voter_id].prop, {from: voters[voter_id].at}),
						'ProposalRegistered', {proposalId: new BN(voter_id)}));
				}
				it(`addProposal(${voters[4].prop}, {from: ${voters[4].at}}, shoulb be revert with message '${revMess.emptyString}'`,
					async () => await expectRevert(VI.addProposal(voters[4].prop, {from: voters[4].at}), revMess.emptyString));
			})
			describe(`functions can't call with the current status`, () => tryFunctions(1))
			describe(`checking proposal be added`, () =>{
				for(let prop_id = 0; prop_id < voters.length - 1; prop_id++){
					it(`proposal ${prop_id} shoulb be '${voters[prop_id].prop}'`, async () =>
						expect((await VI.getOneProposal(prop_id, {from: voters[0].at})).description).equal(voters[prop_id].prop))
				}
				it(`inexisting proposal 10 shoulb be revert`, async () =>
						await expectRevert.unspecified(VI.getOneProposal(10, {from: voters[0].at})))
			})
		})
	})
})