// SPDX-License-Identifier: MIT

pragma solidity >= 0.8.0 <0.9.0;

contract Shop {
    mapping (uint => Item) items;

    struct Item {
        uint price;
        uint units;
    }

    function addItem(uint _id, uint _units) public {
        require(items[_id].price != 0, "item already exist");
        items[_id].units += _units;
    }

    function getItem(uint _id) public view returns (uint, uint){
        return (items[_id].price, items[_id].units);
    }

    function setItem(uint _id, uint _price, uint _units) public {
        items[_id].price = _price;
        items[_id].units = _units;
    }
}
