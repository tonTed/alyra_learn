/*
⚡️ Projet - Système de vote

Un smart contract de vote peut être simple ou complexe, selon les exigences des élections que vous souhaitez soutenir. Le vote peut porter sur un petit nombre de propositions (ou de candidats) présélectionnées, ou sur un nombre potentiellement important de propositions suggérées de manière dynamique par les électeurs eux-mêmes.

Dans ce cadres, vous allez écrire un smart contract de vote pour une petite organisation. Les électeurs, que l'organisation connaît tous, sont inscrits sur une liste blanche (whitelist) grâce à leur adresse Ethereum, peuvent soumettre de nouvelles propositions lors d'une session d'enregistrement des propositions, et peuvent voter sur les propositions lors de la session de vote.

✔️ Le vote n'est pas secret
✔️ Chaque électeur peut voir les votes des autres
✔️ Le gagnant est déterminé à la majorité simple
✔️ La proposition qui obtient le plus de voix l'emporte.


👉 Le processus de vote : 

Voici le déroulement de l'ensemble du processus de vote :

	L'administrateur du vote enregistre une liste blanche d'électeurs identifiés par leur adresse Ethereum.
	L'administrateur du vote commence la session d'enregistrement de la proposition.
	Les électeurs inscrits sont autorisés à enregistrer leurs propositions pendant que la session d'enregistrement est active.
	L'administrateur de vote met fin à la session d'enregistrement des propositions.
	L'administrateur du vote commence la session de vote.
	Les électeurs inscrits votent pour leurs propositions préférées.
	L'administrateur du vote met fin à la session de vote.
	L'administrateur du vote comptabilise les votes.
	Tout le monde peut vérifier les derniers détails de la proposition gagnante.
 

👉 Les recommandations et exigences :

	Votre smart contract doit s’appeler “Voting”. 
	Votre smart contract doit utiliser la dernière version du compilateur.
	L’administrateur est celui qui va déployer le smart contract. 
	Votre smart contract doit définir les structures de données suivantes : 
	struct Voter {
		bool isRegistered;
		bool hasVoted;
		uint votedProposalId;
	}
		struct Proposal {
		string description;
		uint voteCount;
	}
	Votre smart contract doit définir une énumération qui gère les différents états d’un vote
	enum WorkflowStatus {
		RegisteringVoters,
		ProposalsRegistrationStarted,
		ProposalsRegistrationEnded,
		VotingSessionStarted,
		VotingSessionEnded,
		VotesTallied
	}
	Votre smart contract doit définir un uint winningProposalId qui représente l’id du gagnant ou une fonction getWinner qui retourne le gagnant.
	Votre smart contract doit importer le smart contract la librairie “Ownable” d’OpenZepplin.
	Votre smart contract doit définir les événements suivants : 
	event VoterRegistered(address voterAddress); 
	event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
	event ProposalRegistered(uint proposalId);
	event Voted (address voter, uint proposalId);

*/

// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

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

	// TODO convert mapping in list, for message if in list;
	mapping(address => Voter) public whitelist;

	// TODO getter status with string
	WorkflowStatus public status;

    // TODO getter total array
	Proposal[] public proposals;

	// uint winningProposalId;
	// or
	// function getWinner(){
	// }

	event VoterRegistered(address voterAddress); 
	event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
	event ProposalRegistered(uint proposalId);
	event Voted (address voter, uint proposalId);

	modifier onlyRegistered() {
		require(whitelist[msg.sender].isRegistered == true, "You are not register!");
		_;
	}

    // TODO manage all status message in each function calls this modifier?
	// TODO require for both status are equals
    modifier isCurrentStatus(WorkflowStatus _status) {
        require(status == _status, "You can't do this with the current status");
        _;
    }

	// TODO function to remove a voter
	// TODO function to remove all (need list)
	// TODO require for can't add voter after status
	function addVoter(address _voter) external onlyOwner {
		whitelist[_voter].isRegistered = true;
	}

	function _changeStatus(WorkflowStatus _status) private {
		emit WorkflowStatusChange(status, _status);
		status = _status;
	}

	// TODO function for send message to people in whitelis (need list) for all of proposal and vote functions
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

	// TODO manage if proposal not exists
	function vote(uint _proposalId) public onlyRegistered isCurrentStatus(WorkflowStatus.VotingSessionStarted) {
		require(whitelist[msg.sender].hasVoted == false, "you have already voted");
		whitelist[msg.sender].hasVoted = true;
		whitelist[msg.sender].votedProposalId = _proposalId;
		proposals[_proposalId].voteCount++;
	}

	// TODO require after start vote for call this fonction
	function amountVotes() external view onlyOwner returns(uint) {
		uint totalVotes;
		uint len = proposals.length;

		for (uint i = 0; i <  len; i++){
			totalVotes += proposals[i].voteCount;
		}
		return (totalVotes);
	}
}


/*
	[] - "Le vote n'est pas secret" 
		1_ il faut faire un log de tous les votes;
		2_ ou juste si on connais l'addresse du votant on peut voir ce qu'il a voter?

	[] - "Chaque électeur peut voir les votes des autres" quelle est la différence avec le précdent?

	[] - "Le gagnant est déterminé à la majorité simple" si j'ai bien compris on ne dois pas gerer le cas d'une égalité et donc on prend le premier qu'on trouve.

	[] - "La proposition qui obtient le plus de voix l'emporte." idem xD, quelle différence avec le précedent?

	[] - "Les électeurs inscrits votent pour leurs propositions préférées." ils on le droit qu'a un vote? (petite erreurs sur le pluriel du coup :D)

	[] - "Tout le monde peut vérifier les derniers détails de la proposition gagnante." c'est quoi les détails en question?

	[] - structures definies, une variables ou function pour le gagnant, mais on est d'accord qu'on peux faire d'autres variables? :D

	[] - Ou est la limite de la gestions des erreurs/acces pour le projet de "base"?
		Exemples :
			_ si une proposition n'existe pas
			_ le message de non acces a une etape par un message general en disant que tu es pas au bon statut pour faire ca ou il faut etre verbeux pour chaque step?

	Voila c'est tout pour le moment, sans doute d'autre vont venir pendant l'impletementation :D

	-----
	[] - Jusqu'a quel statut pouvont-nous ajouter un votant?

*/