// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

/*
**	TODO list mandatory :
**		[] - Refactor in one function steps workflow
**
**	TODO list bonus :
**		[] - Send message when worflow change
**		[] - Getter status return string
**		[] - Getter total array of proposals
**		[] - Explicit bad current status
**		[] - Function to remove a voter
**		[] - Function to reset.
**		[] - Manage if duplicates proposals
**		[] - Manage equals
*/

contract Voting is Ownable {

	struct Voter {
		bool isRegistered;
		bool hasVoted;
		uint votedProposalId;
	}
	struct Proposal {
		string description;
		uint voteCount;
	}
	enum WorkflowStatus {
		RegisteringVoters,
		ProposalsRegistrationStarted,
		ProposalsRegistrationEnded,
		VotingSessionStarted,
		VotingSessionEnded,
		VotesTallied
	}

	mapping(address => Voter) public whitelist;
	WorkflowStatus public status;
	Proposal[] public proposals;

	event VoterRegistered(address voterAddress); 
	event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
	event ProposalRegistered(uint proposalId);
	event Voted (address voter, uint proposalId);

	modifier onlyRegistered() {
		require(whitelist[msg.sender].isRegistered == true, "You are not register!");
		_;
	}

    modifier isCurrentStatus(WorkflowStatus _status) {
        require(status == _status, "You can't do this with the current status");
        _;
    }

	modifier workflowRespected(WorkflowStatus _status){
		if (uint(_status) != 0){
			require(uint(_status) - 1 == uint(status), "The workflow is not respected");
		}
		_;
	}

	function _changeStatus(WorkflowStatus _status) private workflowRespected(_status) {
		emit WorkflowStatusChange(status, _status);
		status = _status;
	}

	function addVoter(address _voter) external onlyOwner isCurrentStatus(WorkflowStatus.RegisteringVoters){
		whitelist[_voter].isRegistered = true;
	}

	function startProposal() external onlyOwner {
		_changeStatus(WorkflowStatus.ProposalsRegistrationStarted);
	}

	function stopProposal() external onlyOwner {
		_changeStatus(WorkflowStatus.ProposalsRegistrationEnded);
	}

	function startVote() external onlyOwner {
		_changeStatus(WorkflowStatus.VotingSessionStarted);
	}

	function stopVote() external onlyOwner {
		_changeStatus(WorkflowStatus.VotingSessionEnded);
	}

	function addProposal(string calldata _proposal) external onlyRegistered isCurrentStatus(WorkflowStatus.ProposalsRegistrationStarted) {
        proposals.push(Proposal(_proposal, 0));
		emit ProposalRegistered(proposals.length - 1);
	}

	function vote(uint _proposalId) public onlyRegistered isCurrentStatus(WorkflowStatus.VotingSessionStarted) {
		require(whitelist[msg.sender].hasVoted == false, "you have already voted");
		require(_prosalID < proposals.length, "proposal do not exists");
		whitelist[msg.sender].hasVoted = true;
		whitelist[msg.sender].votedProposalId = _proposalId;
		proposals[_proposalId].voteCount++;
		emit Voted(msg.sender, _proposalId);
	}

	function _votesCount() private returns(uint){
		uint totalVotes;
		uint len = proposals.length;

		for (uint i = 0; i <  len; i++){
			totalVotes += proposals[i].voteCount;
		}
		return (totalVotes);
	}

	function amountVotes() external view onlyOwner isCurrentStatus(WorkflowStatus.VotingSessionEnded) returns(uint) {
		uint totalVotes = _votesCount();
		_changeStatus(WorkflowStatus.VotesTallied);
		return (totalVotes);
	}

	function getWinner() public view isCurrentStatus(WorkflowStatus.VotesTallied) returns (uint){
		require(_votesCount(), "nobody voted");
		uint bigger;
		uint len = proposals.length;

		for (uint i = 1; i < len; i++){
			if (proposals[i].voteCount > proposals[bigger].voteCount){
				bigger = i;
			}
		}
		return (bigger);
	}
}
