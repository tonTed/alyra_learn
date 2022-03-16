// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

/*
Faire un compte d’épargne sur la blockchain!

On a le droit de transférer au compte de l’argent quand on le souhaite

1- Ajouter un admin au déploiement du contrat.
2- Ajouter la condition suivante : l'admin ne peut récupérer les fonds qu'après 3 mois après la première transaction
3- On peut évidemment rajouter de l’argent sur le contrat régulièrement. Faire une fonction
pour ça, et garder un historique (simple, d’un numero vers une quantité) des dépots dans un mapping.
4 – Mettre en commentaire les fonctions d’admin, et rajouter onlyOwner

SAVINGS AT (BC=> Kovan) 0x27Ff15d1d1b12D9c912787Db401Dd610d6036DB4
*/

contract Savings {

    address public                  admin;
    uint private                    timeFirstTransaction;
    mapping(uint => uint) private   register;
    uint private                    amountTxs;

    constructor (){
        admin = msg.sender;
    }

    modifier unlockAfterThreeMonths() {
        require(amountTxs > 0, "No transaction has been made");
        require(block.timestamp - timeFirstTransaction >= 90 days, "Time since first transaction too low");
        _;
    }

    modifier onlyAdmin() {
        require(admin == msg.sender, "You are not the admin.");
        _;
    }

    modifier sufficientAmount(uint _amount) {
        require(_amount <= getBalance(), "Insufficient Balance");
        _;
    }

    function withdraw(uint _amount) external onlyAdmin unlockAfterThreeMonths sufficientAmount(_amount){
        (bool sent, ) = admin.call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }

    function getBalance() public view returns (uint) {
        return (address(this).balance);
    }
    
    receive() external payable {
        if (timeFirstTransaction == 0){
            timeFirstTransaction = block.timestamp;
        }
        register[amountTxs] == msg.value;
        amountTxs++;
    }
}
