const Voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');

function expect_equal_BN(arg1, arg2){
	expect(new BN(arg1)).to.be.bignumber.equal(new BN(arg2));
}

const revMess = {
	onlyOwner: "caller is not the owner",
	onlyVoters: "You're not a voter",
	emptyString: "Vous ne pouvez pas ne rien proposer",
	alreadyVote: 'You have already voted',
	badProposal: 'Proposal not found',
	alreadyVoter: "Already registered",
}

contract('Voting', accounts => {
	const admin = accounts[0];
	const voters = [
		{at: accounts[1], prop: "prop1",	vote: 2},
		{at: accounts[2], prop: "prop2",	vote: 0},
		{at: accounts[3], prop: "prop3",	vote: 2},
		{at: accounts[4], prop: "prop4",	vote: 1},
		{at: accounts[5], prop: "",				vote: 8}
	]
	const noVoter = accounts[8];
	const unknow = accounts[9];
	let VI;

	const status = [
		'RegisteringVoters',
		'ProposalsRegistrationStarted',
		'ProposalsRegistrationEnded',
		'VotingSessionStarted',
		'VotingSessionEnded',
		'VotesTallied',
	]

	const funcs = [{
			name: 'addVoter',
			status: 0,
			fn: () => VI.addVoter(unknow, {from: admin}),
			revMess: 'Voters registration is not open yet',},
		{
			name: 'addProposal',
			status: 1,
			fn: () => VI.addProposal("unknow", {from: voters[0].at}),
			revMess: 'Proposals are not allowed yet',},
		{
			name: 'setVote',
			status: 3,
			fn: () => VI.setVote(1, {from: voters[0].at}),
			revMess: 'Voting session havent started yet',},
		{
			name: 'ProposalsRegistrationStarted',
			status: 0,
			fn: () => VI.startProposalsRegistering({from: admin}),
			revMess:' Registering proposals cant be started now',},
		{
			name: 'ProposalsRegistrationEnded',
			status: 1,
			fn: () => VI.endProposalsRegistering({from: admin}),
			revMess: 'Registering proposals havent started yet',},
		{
			name: 'VotingSessionStarted',
			status: 2,
			fn: () => VI.startVotingSession({from: admin}),
			revMess: 'Registering proposals phase is not finished',},
		{
			name: 'VotingSessionEnded',
			status: 3,
			fn: () => VI.endVotingSession({from: admin}),
			revMess: 'Voting session havent started yet',},
		{
			name: 'VotesTallied',
			status: 4,
			fn: () => VI.tallyVotes({from: admin}),
			revMess: "Current status is not voting session ended",}
	]

	function tryFunctions(current_status){
		describe(`Functions can not call with the status ${status[current_status]}:`, () => {
			for(let id_func = 0; id_func < funcs.length; id_func++){
				if(funcs[id_func].status != current_status){
					it(`${funcs[id_func].name}(...) should be revert with message '${funcs[id_func].revMess}'`, async () =>
						await expectRevert(funcs[id_func].fn(), funcs[id_func].revMess));
				}
			}
		})
	}
	
	// VI = VotingInstance
	context("\nTest => visibilities and accessibilities in functions and variables:", () => {
		before(async () => {
			VI = await Voting.new({from: admin});
		})
		context("Visibilities:", () => {
			describe("Public & External:", () => {
				it("winningProposalID",	() => assert.isDefined(VI.winningProposalID));
				it("workflowsStatus",		() => assert.isDefined(VI.workflowStatus));
				it("proposalsArray",		() => assert.isDefined(VI.proposalsArray));
				it("getVoter",					() => assert.isDefined(VI.getVoter));
				it("getOneProposal",		() => assert.isDefined(VI.getOneProposal));
				it("addVoter",					() => assert.isDefined(VI.addVoter));
				it("addProposal",				() => assert.isDefined(VI.addProposal));
				it("setVote",						() => assert.isDefined(VI.setVote));
				
				it("startProposalsRegistering",	() => assert.isDefined(VI.startProposalsRegistering));
				it("endProposalsRegistering",		() => assert.isDefined(VI.endProposalsRegistering));
				it("startVotingSession",				() => assert.isDefined(VI.startVotingSession));
				it("endVotingSession",					() => assert.isDefined(VI.endVotingSession));
				it("tallyVotes",								() => assert.isDefined(VI.tallyVotes));
			})
			describe("Private & Internal:", () => {
				it("winningProposalsID",	() => assert.isUndefined(VI.winningProposalsID));
				it("winningProposals",		() => assert.isUndefined(VI.winningProposals));
				it("voters",							() => assert.isUndefined(VI.voters));
			})
		})
		context("\nAccessibilities:", () => {
			describe(`onlyOwner: revert with message ${revMess.onlyOwner}`, () => {
				it("addVoter(voters[0], {from: unknow})", 			async () => 
					await expectRevert(VI.addVoter(voters[0].at, {from: unknow}), revMess.onlyOwner));
				it("startProposalsRegistering({from: unknow})",	async () =>
					await expectRevert(VI.startProposalsRegistering({from: unknow}), revMess.onlyOwner));
				it("endProposalsRegistering({from: unknow})",		async () =>
					await expectRevert(VI.endProposalsRegistering({from: unknow}), revMess.onlyOwner));
				it("startVotingSession({from: unknow})",				async () =>
					await expectRevert(VI.startVotingSession({from: unknow}), revMess.onlyOwner));
				it("endVotingSession({from: unknow})",					async () =>
					await expectRevert(VI.endVotingSession({from: unknow}), revMess.onlyOwner));
				it("tallyVotes({from: unknow})",								async () =>
					await expectRevert(VI.tallyVotes({from: unknow}), revMess.onlyOwner));
			})
			describe(`onlyVoters: revert with message ${revMess.onlyVoters}`, () => {
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
	context("\n\nTest => Full process testing", () => {
		before(async () =>{
			VI = await Voting.new({from: admin})
		})
		context(`While ${status[0]}:`, () =>{
			let WF_status = 0;
			it(`Current status shoulb be ${WF_status}`, 	async () =>
			expect_equal_BN(await VI.workflowStatus({from: admin}), WF_status));
			describe("Adding voters {from: admin}:", () => {
				for (let voter_id = 0; voter_id < voters.length; voter_id++){
					it(`addVoter(voters[${voter_id}]), event VoterRegistered shoulb be emit [${voters[voter_id].at}]`,
						async () => expectEvent(await VI.addVoter(voters[voter_id].at, {from: admin}), 'VoterRegistered', {voterAddress: voters[voter_id].at}))
				}
				it(`addVoter(voters[0]), shoulb be revert with message: ${revMess.alreadyVoter}`, 
						async () => await expectRevert(VI.addVoter(voters[0].at, {from: admin}), revMess.alreadyVoter))
			})
			describe(`Getting voters:`, () =>{
				for (let voter_id = 0; voter_id < voters.length; voter_id++){
					it(`getVoter(voters[${voter_id}], {from: voters[0]}).isRegistered() should be return true`,
					async () => expect((await VI.getVoter(voters[voter_id].at, {from: voters[0].at})).isRegistered).true)
				}
				it(`getVoter(unknow), {from: voters[0]}).isRegistered() should be return false`, 
				async () => expect((await VI.getVoter(unknow, {from: voters[0].at})).isRegistered).false)
			})
			tryFunctions(WF_status);
		})
		context(`While ${status[1]}:`, () =>{
			const WF_status = 1;
			it(`Status to ${status[WF_status]} with startProposalsRegistering({from: admin}) event should be [${WF_status - 1}, ${WF_status}]`,
			async () => expectEvent(await VI.startProposalsRegistering({from: admin}), 'WorkflowStatusChange',
			{previousStatus: new BN(WF_status - 1), newStatus: new BN(WF_status)}))
			it(`Current status shoulb be 1`, 	async () =>
				expect_equal_BN(await VI.workflowStatus({from: admin}), WF_status));
			describe(`Adding proposals:`, () =>{		
				for (let voter_id = 0; voter_id < voters.length - 1; voter_id++){
					it(`addProposal(${voters[voter_id].prop}, {from: voters[${voter_id}]}, event ProposalRegistered shoulb be emit [${voter_id}]`,
						async () => expectEvent(await VI.addProposal(voters[voter_id].prop, {from: voters[voter_id].at}),
						'ProposalRegistered', {proposalId: new BN(voter_id)}));
				}
				it(`addProposal(${voters[4].prop}, {from: voters[4], shoulb be revert with message '${revMess.emptyString}'`,
					async () => await expectRevert(VI.addProposal(voters[4].prop, {from: voters[4].at}), revMess.emptyString));
			})
			tryFunctions(WF_status);
			describe(`Checking proposal added:`, () =>{
				for(let prop_id = 0; prop_id < voters.length - 1; prop_id++){
					it(`getOneProposal(${prop_id}, {from: voters[0]}) shoulb be '${voters[prop_id].prop}'`, async () =>
					expect((await VI.getOneProposal(prop_id, {from: voters[0].at})).description).equal(voters[prop_id].prop))
				}
				it(`inexisting proposal 10 shoulb be revert`, async () =>
				await expectRevert.unspecified(VI.getOneProposal(10, {from: voters[0].at})))
			})
		})
		context(`While ${status[2]}:`, () =>{
			const WF_status = 2;
			it(`Status to ${status[WF_status]} with endProposalsRegistering({from: admin}) event should be [${WF_status - 1}, ${WF_status}]`,
			async () => expectEvent(await VI.endProposalsRegistering({from: admin}), 'WorkflowStatusChange',
			{previousStatus: new BN(WF_status - 1), newStatus: new BN(WF_status)}))
			it(`Current status shoulb be ${WF_status}`, 	async () =>
			expect_equal_BN(await VI.workflowStatus({from: admin}), WF_status));
			tryFunctions(WF_status);
		})
		context(`While ${status[3]}:`, () =>{
			const WF_status = 3;
			it(`Status to ${status[WF_status]} with startVotingSession({from: admin}) event should be [${WF_status - 1}, ${WF_status}]`,
				async () => expectEvent(await VI.startVotingSession({from: admin}), 'WorkflowStatusChange',
				{previousStatus: new BN(WF_status - 1), newStatus: new BN(WF_status)}))
			it(`Current status shoulb be ${WF_status}`, 	async () =>
				expect_equal_BN(await VI.workflowStatus({from: admin}), WF_status));
			describe(`Adding votes:`, () =>{		
				for (let voter_id = 0; voter_id < voters.length - 1; voter_id++){
					it(`setVote(${voters[voter_id].vote}, {from: voters[${voter_id}]}, event Voted shoulb be emit (voters[${voter_id}], ${voters[voter_id].vote})`,
						async () => expectEvent(await VI.setVote(voters[voter_id].vote, {from: voters[voter_id].at}),
						'Voted', {voter: voters[voter_id].at, proposalId: new BN(voters[voter_id].vote)}));
				}
				it(`setVote(${voters[0].vote}, {from: voters[0]}, shoulb be revert with message '${revMess.alreadyVote}'`,
					async () => await expectRevert(VI.setVote(voters[0].vote, {from: voters[0].at}), revMess.alreadyVote));
				it(`setVote(${voters[4].vote}, {from: voters[4]}, shoulb be revert with message '${revMess.badProposal}'`,
					async () => await expectRevert(VI.setVote(voters[4].vote, {from: voters[4].at}), revMess.badProposal));
			})
			describe(`Checking proposals voted:`, () =>{
				it(`proposalsArray(0, {from: voters[0]).voteCount shoulb be 1`, 			async () =>
					expect_equal_BN((await VI.proposalsArray(0, {from: voters[0].at})).voteCount, 1));
				it(`proposalsArray(1, {from: voters[0]).voteCount shoulb be 1`, 			async () =>
					expect_equal_BN((await VI.proposalsArray(1, {from: voters[0].at})).voteCount, 1));
				it(`proposalsArray(2, {from: voters[0]).voteCount shoulb be 2`, 			async () =>
					expect_equal_BN((await VI.proposalsArray(2, {from: voters[0].at})).voteCount, 2));
				it(`proposalsArray(3, {from: voters[0]).voteCount shoulb be 0`, 			async () =>
					expect_equal_BN((await VI.proposalsArray(3, {from: voters[0].at})).voteCount, 0));
				it(`proposalsArray(4, {from: voters[0]).voteCount shoulb be revert`,	async () =>
					await expectRevert.unspecified(VI.proposalsArray(4, {from: voters[0].at})));
			})
			describe(`Checking voters [isRegistered, hasVoted, votedProposalId]:`, () =>{
					it(`getVoter(0, {from: voters[0]}) shoulb [true, true, 2]`, async () =>{
						expect(await VI.getVoter.call(voters[0].at, {from: voters[0].at})).deep.equal([true, true, '2']);
					})
					it(`getVoter(1, {from: voters[0]}) should be [true, true, 0]`, async () =>{
						expect(await VI.getVoter.call(voters[1].at, {from: voters[0].at})).deep.equal([true, true, '0']);
					})
					it(`getVoter(2, {from: voters[0]}) should be [true, true, 2]`, async () =>{
						expect(await VI.getVoter.call(voters[2].at, {from: voters[0].at})).deep.equal([true, true, '2']);
					})
					it(`getVoter(3, {from: voters[0]}) should be [true, true, 1]`, async () =>{
						expect(await VI.getVoter.call(voters[3].at, {from: voters[0].at})).deep.equal([true, true, '1']);
					})
					it(`getVoter(4, {from: voters[0]}) should be [true, false, 0]`, async () =>{
						expect(await VI.getVoter.call(voters[4].at, {from: voters[0].at})).deep.equal([true, false, '0']);
					})
					it(`getVoter(unknow, {from: voters[0]}) should be [false, false, 0]`, async () =>{
						expect(await VI.getVoter.call(unknow, {from: voters[0].at})).deep.equal([false, false, '0']);
					})
			})
			tryFunctions(WF_status);
		})
		context(`While ${status[4]}:`, () =>{
			const WF_status = 4;
			it(`Status to ${status[WF_status]} with endVotingSession({from: admin}) event should be [${WF_status - 1}, ${WF_status}]`,
				async () => expectEvent(await VI.endVotingSession({from: admin}), 'WorkflowStatusChange',
				{previousStatus: new BN(WF_status - 1), newStatus: new BN(WF_status)}))
			it(`Current status shoulb be ${WF_status}`, 	async () =>
				expect_equal_BN(await VI.workflowStatus({from: admin}), WF_status));
			tryFunctions(WF_status);
		})
		context(`While ${status[5]}:`, () =>{
			const WF_status = 5;
			it(`Status to ${status[WF_status]} with tallyVotes({from: admin}) event should be [${WF_status - 1}, ${WF_status}]`,
				async () => expectEvent(await VI.tallyVotes({from: admin}), 'WorkflowStatusChange',
				{previousStatus: new BN(WF_status - 1), newStatus: new BN(WF_status)}))
			it(`Current status shoulb be 5`, 	async () =>
				expect_equal_BN(await VI.workflowStatus({from: admin}), WF_status));
			it(`winningProposalID() should be return 2`, async () =>
				expect_equal_BN(await VI.winningProposalID({from: admin}), 2));
			tryFunctions(WF_status)
		})
	})
})