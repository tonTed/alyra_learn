// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

/*
**
**	TODO list bonus :
**		[x] - Manage if voter already added
**		[x] - Manage if duplicates proposals
**		[] - Send message when worflow change
**		[x] - Getter status return string
**		[x] - Getter total array of proposals
**		[x] - Getter voter add condition if no voted
**		[x] - Function to remove a voter
**		[x] - Function to reset TODO -> to test
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
		WorkflowStatus private status;
		Proposal[] private proposals;

	// Events
		event VoterRegistered(address voterAddress); 
		event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
		event ProposalRegistered(uint proposalId);
		event Voted (address voter, uint proposalId);
		event LogNotSent(WorkflowStatus status, address registered);

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

		modifier proposalExists(uint _proposalId){
			require(_proposalId < proposals.length, "proposal do not exists");
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

	// External Functions
		function nextStep() external onlyOwner {
			require(status < WorkflowStatus.VotesTallied, "Votes are Tallied, the votes are over");
			if (status == WorkflowStatus.VotingSessionEnded) {
				_votesCount();
			}
			emit WorkflowStatusChange(status, WorkflowStatus(uint(status) + 1));
			status = WorkflowStatus(uint(status) + 1);
			_notificationToRegistered();
		}

		function addVoter(address _voter) external onlyOwner isCurrentStatus(WorkflowStatus.RegisteringVoters){
			require(whitelist[_voter].isRegistered == false, "Voter already registered");
			whitelist[_voter].isRegistered = true;
			_whitelist.push(_voter);
		}

		function addProposal(string calldata _proposal) external onlyRegistered isCurrentStatus(WorkflowStatus.ProposalsRegistrationStarted) {
			require(_proposalExists(_proposal) != true, "The proposal already exists");
			proposals.push(Proposal(_proposal, 0));
			emit ProposalRegistered(proposals.length - 1);
		}

		function vote(uint _proposalId) external onlyRegistered isCurrentStatus(WorkflowStatus.VotingSessionStarted) proposalExists(_proposalId) {
			require(whitelist[msg.sender].hasVoted == false, "you have already voted");
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

	// BONUS
		// TODO function for new list without the voter removed
		function removeVoter(address _voter) external onlyOwner isCurrentStatus(WorkflowStatus.RegisteringVoters){
			whitelist[_voter].isRegistered = false;
			for (uint i = _whitelist.length - 1; i >= 0; i--) {
				if (_whitelist[i] == _voter) {
					whitelist[_voter].isRegistered = false;
				}
			}
		}

		function _resetProposals() private {
			delete proposals;
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

	event Response(bool success, bytes data);
	event Debug(bool sent, bytes data);
	// Work in progress
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
}
