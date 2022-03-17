// SPDX-License-Identifier: MIT

pragma solidity >= 0.8.0 <0.9.0;

contract Shop {
    
    struct Item {
        uint price;
        uint units;
    }

    Item[] items;

    function addItem(uint _units, uint _price) public {
        items.push(Item(_units, _price));
    }

    function getItem(uint _id) public view returns (uint, uint){
        return (items[_id].price, items[_id].units);
    }

    function setItem(uint _id, uint _price, uint _units) public {
        items[_id].price = _price;
        items[_id].units = _units;
    }

    function deleteLastItem() public {
        items.pop();
    }

    function totalItems() public view returns (uint) {
        return (items.length);
    }
}
