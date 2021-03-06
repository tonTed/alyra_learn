# Alyra: Project 1

## Table of contents
- [Subject](#subject)
	- [Description](#description)
	- [Requirements](#requirements)
	- [Voting process](#voting-process)
- [Madatory Implementation](#mandatory-implementation)
	- [Modifier](#modifier)
	- [Private functions](#private-functions)
	- [External function called only by Owner](#External-function-called-only-by-owner)
	- [External function](#External-function)
- [Bonus Implementation](#bonus-implementation)
	- [New variables](#New-Variables)
	- [Remove voter](#Remove-voter)
	- [Reset](#Reset)
	- [Proposals exists](#Proposals-exists)
	- [Explicit getters](#Explicit-getters)
- [TODO](#todo)


## Subject

### Description:

In this project, you will write a voting smart contract for a small organization. Voters, all known to the organization, are whitelisted by their Ethereum address, can submit new proposals during a proposal registration session, and can vote on proposals during the voting session.

### Requirements:

- Voting is not secret
- The winner is determined by simple majority
- Your smart contract must be called “Voting”.
- Your smart contract must use the latest version of the compiler.
- The administrator is the one who will deploy the smart contract.
- Your smart contract must define the following data structures:

```solidity
struct Vote {
	bool isRegistered;
	bool hasVoted;
	uint votedProposalId;
}

struct Proposal {
	string description;
	uint voteCount;
}
```

- Your smart contract must define an enumeration that manages the different states of a vote:

```solidity
enum WorkflowStatus {
	RegisteringVoters,
	ProposalsRegistrationStarted,
	ProposalsRegistrationEnded,
	VotingSessionStarted,
	VotingSessionEnded,
	VotesTallied
}
```

- Your smart contract must define a winningProposalId uint that represents the winner's id or a getWinner function that returns the winner.
- Your smart contract must import the smart contract from the OpenZepplin “Ownable” library (https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol).
- Your smart contract must define the following events:

```solidity
event VoterRegistered(address voterAddress);
event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
event ProposalRegistered(uint proposalId);
event Voted (address vote, uint proposalId);
```

### Voting process:

1. The voting administrator registers a whitelist of voters identified by their Ethereum address.
2. The voting administrator starts the recording session of the proposal.
3. Registered voters are allowed to register their proposals while the registration session is active.
4. The voting administrator terminates the proposal recording session.
5. The voting administrator starts the voting session.
6. Registered voters vote for their preferred proposal.
7. The voting administrator ends the voting session.
8. The voting administrator counts the votes.
9. Everyone can check the final details of the winning proposal.

## Mandatory implementation

### Modifier

```solidity
modifier onlyRegistered() {...}
modifier isCurrentStatus(WorkflowStatus _status) {...}
modifier workflowRespected(WorkflowStatus _status){...}
modifier proposalExists(uint _proposalId){...}
```

### Private functions

```solidity
function _votesCount() private view returns(uint){...}
```

### External function called only by Owner

```solidity
function nextStep() external onlyOwner {...}
function addVoter(address _voter) external onlyOwner isCurrentStatus(WorkflowStatus.RegisteringVoters){...}
```

### External function

```solidity
function addProposal(string calldata _proposal) public onlyRegistered isCurrentStatus(WorkflowStatus.ProposalsRegistrationStarted) {...}
function vote(uint _proposalId) external onlyRegistered isCurrentStatus(WorkflowStatus.VotingSessionStarted) proposalExists(_proposalId) {...}
function getWinner() external view isCurrentStatus(WorkflowStatus.VotesTallied) returns (uint){...}
```

## Bonus implementation

### New Variables
For various bonus we need a list of voters registered

```solidity
address[] private _whitelist;
```

### Remove voter
Remove a voter during the status `RegisteringVoters`

```solidity
function removeVoter(address _voter) external onlyOwner isCurrentStatus(WorkflowStatus.RegisteringVoters){
	whitelist[_voter].isRegistered = false;
	for (uint i = _whitelist.length - 1; i >= 0; i--) {
		if (_whitelist[i] == _voter) {
			whitelist[_voter].isRegistered = false;
		}
	}
}
```

### Reset 
Reset the process at the end (status `VotesTallied`)

```solidity
function _resetProposals() private {
	delete proposals;
}

function _resetWaitingList() private {
	delete _waitingRegistered;
}

function _resetWhitelist() private {
	if (_whitelist.length > 0) {
		for (uint i = _whitelist.length; i > 0; i--) {
			whitelist[_whitelist[i - 1]] = Voter(false, false, 0);
			_whitelist.pop();
		}
	}
}

function reset() external onlyOwner isCurrentStatus(WorkflowStatus.VotesTallied){
	status = WorkflowStatus.RegisteringVoters;
	_resetProposals();
	_resetWhitelist();
}
```

### Proposals exists
Check if a proposals already exists
> `_proposalExists(...)` is called by de mandatory function `addProposal(...)`

```solidity
function _strcmp(string calldata s1, string memory s2) private pure returns (bool){
	if (keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2))){
		return (true);
	}
	return (false);
}

function _proposalExists(string calldata s1) private view returns (bool){
	for (uint i = proposals.length; i > 0; i--){
		if (_strcmp(s1, proposals[i - 1].description) == true){
			return (true);
		}
	}
	return (false);
}
```

### Public request to be registered
This feature is for anybody request the contract to be registered, the owner can check the list and add them.
```solidity
address[] private _waitingRegistered;

function _addressExists(address[] memory _array) private view returns (bool){
	for (uint i = _array.length; i > 0; i--){
		if (_array[i - 1] == msg.sender){
			return (true);
		}
	}
	return (false);
}

function requestToBeRegistered() external isCurrentStatus(WorkflowStatus.RegisteringVoters){
	require(!_addressExists(_waitingRegistered), "You are already on the waiting list");
	_waitingRegistered.push(msg.sender);
}

function getWaitingListRegistered() external view onlyOwner returns (address[] memory){
	require(_waitingRegistered.length > 0, "The waitting list is empty");
	return (_waitingRegistered);
}

function addWaitingList() external onlyOwner isCurrentStatus(WorkflowStatus.RegisteringVoters) {
	for (uint i = _waitingRegistered.length; i > 0; i--){
		this.addVoter(_waitingRegistered[i - 1]);
	}
}
```

### Explicit getters
Getter data more explicit
> :danger: These functions were implemented to make them more verbose, however during a real project they will be managed by the front-end and not by the contract

```solidity
function getCurrentStatus() external view returns (string memory){
	if (status == WorkflowStatus.RegisteringVoters){
		return ("Registering voters");
	} else if (status == WorkflowStatus.ProposalsRegistrationStarted){
		return ("Proposals registration started");
	} else if (status == WorkflowStatus.ProposalsRegistrationEnded){
		return ("Proposals registration ended");
	} else if (status == WorkflowStatus.VotingSessionStarted){
		return ("Voting session started");
	} else if (status == WorkflowStatus.VotingSessionEnded){
		return ("Voting session ended");
	} else if (status == WorkflowStatus.VotesTallied){
		return ("Votes tallied");
	} else { return ("Error");}
}

function getProposals() external view returns (Proposal[] memory){
	require(proposals.length > 0, "List of proposals are empty");
	return(proposals);
}

function getProposal(uint _index) external view proposalExists(_index) returns (Proposal memory){
	return(proposals[_index]);
}
```

### TODO:
- [ ] Send message when worflow change
```solidity
// Work in progress
	event LogNotSent(WorkflowStatus status, address registered);
	event Response(bool success, bytes data);
	function _notificationToRegistered() private {
		for (uint i = _whitelist.length; i > 0; i--){
			if (whitelist[_whitelist[i - 1]].isRegistered == true){
				(bool success,bytes memory data) = address(_whitelist[i - 1]).call(abi.encodeWithSignature("test"));
				emit Response(success, data);
				if (!success){
					emit LogNotSent(status, _whitelist[i - 1]);
				}
			}
		}
	}
```

- [ ] Manage equals