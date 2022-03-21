// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

/*
**
**	TODO list bonus :
**		[] - Manage if voter already added
**		[] - Manage if duplicates proposals
**		[] - Send message when worflow change
**		[] - Getter status return string
**		[] - Getter total array of proposals
**		[] - Getter voter add condition if no voted
**		[] - Explicit bad current status
**		[x] - Function to remove a voter
**		[] - Function to reset.
**		[] - Manage equals
*/

contract Voting is Ownable {

	// Declaration
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
		address[] private _whitelist;
		WorkflowStatus public status;
		Proposal[] public proposals;

	// Events
		event VoterRegistered(address voterAddress); 
		event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
		event ProposalRegistered(uint proposalId);
		event Voted (address voter, uint proposalId);

	// Modifier
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

	/* Old functions
		function _changeStatus(WorkflowStatus _status) private workflowRespected(_status) {
			emit WorkflowStatusChange(status, _status);
			status = _status;
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
	*/
	// Private functions
		function _votesCount() private view returns(uint){
			uint totalVotes;
			uint len = proposals.length;

			for (uint i = 0; i <  len; i++){
				totalVotes += proposals[i].voteCount;
			}
			return (totalVotes);
		}

	function nextStep() external onlyOwner {
		require(status < WorkflowStatus.VotesTallied, "Votes are Tallied, the votes are over");
		if (status == WorkflowStatus.VotingSessionEnded) {
			_votesCount();
		}
		emit WorkflowStatusChange(status, WorkflowStatus(uint(status) + 1));
		status = WorkflowStatus(uint(status) + 1);
	}

	function addVoter(address _voter) external onlyOwner isCurrentStatus(WorkflowStatus.RegisteringVoters){
		require(whitelist[_voter].isRegistered == false, "Voter already registered");
		whitelist[_voter].isRegistered = true;
		_whitelist.push(_voter);
	}

	// TODO function for new list without the voter removed
	function removeVoter(address _voter) external onlyOwner isCurrentStatus(WorkflowStatus.RegisteringVoters){
		whitelist[_voter].isRegistered = false;
		for (uint i = _whitelist.length - 1; i >= 0; i--) {
			if (_whitelist[i] == _voter) {
				whitelist[_voter].isRegistered = false;
			}
		}
	}


	function addProposal(string calldata _proposal) external onlyRegistered isCurrentStatus(WorkflowStatus.ProposalsRegistrationStarted) {
        proposals.push(Proposal(_proposal, 0));
		emit ProposalRegistered(proposals.length - 1);
	}

	function vote(uint _proposalId) external onlyRegistered isCurrentStatus(WorkflowStatus.VotingSessionStarted) {
		require(whitelist[msg.sender].hasVoted == false, "you have already voted");
		require(_proposalId < proposals.length, "proposal do not exists");
		whitelist[msg.sender].hasVoted = true;
		whitelist[msg.sender].votedProposalId = _proposalId;
		proposals[_proposalId].voteCount++;
		emit Voted(msg.sender, _proposalId);
	}

	function getWinner() external view isCurrentStatus(WorkflowStatus.VotesTallied) returns (uint){
		require(_votesCount() > 0, "nobody voted");
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