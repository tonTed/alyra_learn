# Alyra: Project 2

## Table of contents
- [TOC](#Table-of-contents)
- [Subject](#Subject)
- [Global test architecture](#Global-test-architecture)
- [Detailed test](#Detailed-test)
	- [Visibilities](#Visibilities)
	- [Accessibilities](#Visibilities)
	- [Full process Worflow](#Full-process-Worflow)
- [Assertion Styles Used](#Assertion-Styles-Used)
- [Supports](#Supports)
- [TODO](#Todo)

---
---


## Subject
> You must then provide the unit tests of your smart contract. We do not expect 100% coverage of the smart contract but be sure to test the different possibilities of returns (event, revert).

---

## Rendering:
- [voting.sol](https://github.com/tonTed/alyra_learn/blob/master/truffleLearn/contracts/2_Voting.sol)
- [test_voting.js](https://github.com/tonTed/alyra_learn/blob/master/truffleLearn/test/2_TestVoting.js)

---
---
<br>

## Global test architecture:
> Structure of how the test works, the tests will be detailed in the following.
```
├── Test => visibilities and accessibilities in functions and variables:
│    ├── Visibilities:
│    │    ├── Public & External:
│    │    └── Private & Internal:
│    │
│    └── Accessibilities:
│         ├── onlyOwner: revert with message caller is not the owner
│         └── onlyVoters: revert with message ou're not a voter
│		
└── Test => Full process testing
     ├── While RegisteringVoters:
     │    ├── Adding voters {from: admin}:
     │    ├── Getting voters:
     │    └── Functions can not call with the status RegisteringVoters:
     │
     ├── While ProposalsRegistrationStarted:
     │    ├── Adding proposals:
     │    ├── Functions can not call with the status ProposalsRegistrationStarted:
     │    └── Checking proposal added:
     │
     ├── While ProposalsRegistrationEnded:
     │    └──Functions can not call with the status ProposalsRegistrationEnded:
     │
     ├── While VotingSessionStarted:
     │    ├── Adding votes:
     │    ├── Checking proposals voted:
     │    ├── Checking voters [isRegistered, hasVoted, votedProposalId]:
     │    └── Functions can not call with the status VotingSessionStarted:
     │
     ├── While VotingSessionEnded:
     │    └── Functions can not call with the status VotingSessionEnded:
     │
     └── While VotesTallied:
          └── Functions can not call with the status VotesTallied:
```

---

<br>

## Detailed test:

### Visibilities:
> At first we test all of functions an variables of the smart contract, for confirm that all visibilities are respected.
For the public and external assets
```js
// For the public and external assets
assert.isDefined();

// For the public and external assets
assert.isUndefined();
```
<details>
  <summary>Functions:</summary>
  
  ```javascript
    describe("Public & External:", () => {
		it("winningProposalID",	() => assert.isDefined(VI.winningProposalID));
		it("workflowsStatus",	() => assert.isDefined(VI.workflowStatus));
		it("proposalsArray",	() => assert.isDefined(VI.proposalsArray));
		it("getVoter",		() => assert.isDefined(VI.getVoter));
		it("getOneProposal",	() => assert.isDefined(VI.getOneProposal));
		it("addVoter",		() => assert.isDefined(VI.addVoter));
		it("addProposal",	() => assert.isDefined(VI.addProposal));
		it("setVote",		() => assert.isDefined(VI.setVote));
				
		it("startProposalsRegistering",	() => assert.isDefined(VI.startProposalsRegistering));
		it("endProposalsRegistering",	() => assert.isDefined(VI.endProposalsRegistering));
		it("startVotingSession",	() => assert.isDefined(VI.startVotingSession));
		it("endVotingSession",		() => assert.isDefined(VI.endVotingSession));
		it("tallyVotes",		() => assert.isDefined(VI.tallyVotes));
	})
	describe("Private & Internal:", () => {
		it("winningProposalsID",	() => assert.isUndefined(VI.winningProposalsID));
		it("winningProposals",		() => assert.isUndefined(VI.winningProposals));
		it("voters",			() => assert.isUndefined(VI.voters));
	})
  ```
</details>

---

<br>

### Accessibilities:
> Then we test all limited access to functions, and therefore test modifier (require access).

`onlyOwner` & `onlyVoters`.
```js
expectRevert();
```
<details>
  <summary>Functions:</summary>
  
  ```javascript
    describe(`onlyOwner: revert with message ${revMess.onlyOwner}`, () => {
		it("addVoter(voters[0], {from: unknow})", 	async () => 
			await expectRevert(VI.addVoter(voters[0].at, {from: unknow}), revMess.onlyOwner));
		it("startProposalsRegistering({from: unknow})",	async () =>
			await expectRevert(VI.startProposalsRegistering({from: unknow}), revMess.onlyOwner));
		it("endProposalsRegistering({from: unknow})",	async () =>
			await expectRevert(VI.endProposalsRegistering({from: unknow}), revMess.onlyOwner));
		it("startVotingSession({from: unknow})",	async () =>
			await expectRevert(VI.startVotingSession({from: unknow}), revMess.onlyOwner));
		it("endVotingSession({from: unknow})",		async () =>
			await expectRevert(VI.endVotingSession({from: unknow}), revMess.onlyOwner));
		it("tallyVotes({from: unknow})",		async () =>
			await expectRevert(VI.tallyVotes({from: unknow}), revMess.onlyOwner));
	})
	describe(`onlyVoters: revert with message ${revMess.onlyVoters}`, () => {
		it("getVoter(voters[0], {from: admin})",	async () =>
			await expectRevert(VI.getVoter(voters[0].at, {from: admin}), revMess.onlyVoters));
		it("getOneProposal(0, {from: noVoter})",	async () =>
			await expectRevert(VI.getOneProposal(0, {from: noVoter}), revMess.onlyVoters));
		it("addProposal('desc', {from: admin})",	async () =>
			await expectRevert(VI.addProposal("desc", {from: admin}), revMess.onlyVoters));
		it("setVote(0, {from: noVoter})",		async () =>
			await expectRevert(VI.setVote(0, {from: noVoter}), revMess.onlyVoters));
	})
  ```
</details>

---

<br>

### Full process Worflow:
> At last a simulation of the process is launched.
- [Helpers](#Helpers)
- [Assertion Styles](#Assertion-Styles)

---

#### Helpers:
> In order to facilitate the implementation and understanding, we have implemented helpers

- <details>
  <summary>Revert messages:</summary>
	
  ```javascript
	const revMess = {
		onlyOwner: "caller is not the owner",
		onlyVoters: "ou're not a voter",
		emptyString: "Vous ne pouvez pas ne rien proposer",
		alreadyVote: 'You have already voted',
		badProposal: 'Proposal not found',
	}
  ```
  </details>
- <details>
  <summary>Function for expect numbers:</summary>
	
  ```javascript
	function expect_equal_BN(arg1, arg2){
		expect(new BN(arg1)).to.be.bignumber.equal(new BN(arg2));
	}
  ```
  </details>
- <details>
  <summary>Accounts:</summary>
	
  ```javascript
	const admin = accounts[0];
	const voters = [
		{at: accounts[1], prop: "prop1",	vote: 2},
		{at: accounts[2], prop: "prop2",	vote: 0},
		{at: accounts[3], prop: "prop3",	vote: 2},
		{at: accounts[4], prop: "prop4",	vote: 1},
		{at: accounts[5], prop: "",		vote: 8}
	]
	const noVoter = accounts[8];
	const unknow = accounts[9];
  ```
  </details>
- <details>
  <summary>Object with functions:</summary>
	
  ```javascript
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
  ```
  </details>
- <details>
  <summary>Function for try alls functions can't be call in a specific status:</summary>
	
  ```javascript
	function tryFunctions(current_status){
		describe(`Functions can not call with the status ${status[current_status]}:`, () => {
			for(let id_func = 0; id_func < funcs.length; id_func++){
				if(funcs[id_func].status != current_status){
					it(`${funcs[id_func].name}(...) should be revert with message '${funcs[id_func].revMess}'`, 
						async () => await expectRevert(funcs[id_func].fn(), funcs[id_func].revMess));
				}
			}
		})
	}
  ```
  </details>

---

#### Assertion Styles:
```js
expectRevert(...);
expectEvent(...)
expect(...).equal(...);
expect(...).deep.equal(...);
```
<details>
  <summary>Functions:</summary>
  
  ```javascript
    describe(`onlyOwner: revert with message ${revMess.onlyOwner}`, () => {
		it("addVoter(voters[0], {from: unknow})", 	async () => 
			await expectRevert(VI.addVoter(voters[0].at, {from: unknow}), revMess.onlyOwner));
		it("startProposalsRegistering({from: unknow})",	async () =>
			await expectRevert(VI.startProposalsRegistering({from: unknow}), revMess.onlyOwner));
		it("endProposalsRegistering({from: unknow})",	async () =>
			await expectRevert(VI.endProposalsRegistering({from: unknow}), revMess.onlyOwner));
		it("startVotingSession({from: unknow})",	async () =>
			await expectRevert(VI.startVotingSession({from: unknow}), revMess.onlyOwner));
		it("endVotingSession({from: unknow})",		async () =>
			await expectRevert(VI.endVotingSession({from: unknow}), revMess.onlyOwner));
		it("tallyVotes({from: unknow})",		async () =>
			await expectRevert(VI.tallyVotes({from: unknow}), revMess.onlyOwner));
	})
	describe(`onlyVoters: revert with message ${revMess.onlyVoters}`, () => {
		it("getVoter(voters[0], {from: admin})",	async () =>
			await expectRevert(VI.getVoter(voters[0].at, {from: admin}), revMess.onlyVoters));
		it("getOneProposal(0, {from: noVoter})",	async () =>
			await expectRevert(VI.getOneProposal(0, {from: noVoter}), revMess.onlyVoters));
		it("addProposal('desc', {from: admin})",	async () =>
			await expectRevert(VI.addProposal("desc", {from: admin}), revMess.onlyVoters));
		it("setVote(0, {from: noVoter})",		async () =>
			await expectRevert(VI.setVote(0, {from: noVoter}), revMess.onlyVoters));
	})
  ```
</details><br>

---

<br>

## Assertion Styles Used:
```js
assert.isDefined();
assert.isUndefined();
expectRevert(...);
expectEvent(...)
expect(...).equal(...);
expect(...).deep.equal(...);
BN()
```
---

<br>

## Supports:
- [Chai Assertion Library / API](https://www.chaijs.com/api/)
- [OpenZeppelin TestHelpers / API](https://docs.openzeppelin.com/test-helpers/0.5/api)
- [Mocha documentation](https://mochajs.org/)

---

<br>

## Todo:
- [ ] Readme
- [x] Remove the testing of all status (already test with `tryFcuntions()`), just add the current status check in each test
- [x] Refactor status number by a value in each context.
- [x] improve message in each `context`, `describe`, `it`
- [x] change assert by expect
