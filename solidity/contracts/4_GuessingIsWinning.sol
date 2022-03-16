// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

/*
Faire un "deviner c'est gagné!"

Un administrateur va placer un mot, et un indice sur le mot
Les joueurs vont tenter de découvrir ce mot en faisant un essai

Le jeu doit donc
1) instancier un owner
2) permettre a l'owner de mettre un mot et un indice
3) les autres joueurs vont avoir un getter sur l'indice
4) ils peuvent proposer un mot, qui sera comparé au mot référence, return un boolean
5) les joueurs seront inscrit dans un mapping qui permet de savoir si il a déjà joué
6) avoir un getter, qui donne si il existe le gagnant.
7) facultatif (necessite un array): faire un reset du jeu pour relancer une instance

GUESSINGISWINNING AT (BC=> Kovan) 0x396d497f6dE8967c070B203e972DDffc70Bdd5F1
*/

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract GuessingIsWinning is Ownable {
    bytes32 word;
    string public clue;
    address public winner;
    mapping(address => bytes32) public gamers;

    modifier ditNotItPlay(){
        require(gamers[msg.sender] == 0x0 , "you have already played");
        _;
    }

    modifier winnerNotExists(){
        require(winner == address(0x0), "winner already exists");
        _;
    }

    /*
    Faire un liste des owners...
    */
    modifier isNotOwner(){
        require(owner() != msg.sender, "the owner can't play");
        _;
    }

    function setWord(string calldata _word) public onlyOwner {
        word = keccak256(abi.encodePacked(_word));
    }

    function setClue(string calldata _clue) public onlyOwner {
        clue = _clue;
    }

    function tryWord(string calldata _tryWord) public ditNotItPlay isNotOwner winnerNotExists returns(bool){
        gamers[msg.sender] = keccak256(abi.encodePacked(_tryWord));
        if (gamers[msg.sender] == word){
            winner = msg.sender;
            return (true);
        }
        return (false);
    }
}