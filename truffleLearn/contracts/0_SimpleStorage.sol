 // SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

contract SimpleStorage {
    uint storedData;

    event dataStored(uint _data, address _addr);

    function set(uint x) public {
        require(x>=1, "vous ne pouvez pas mettre une valeur nulle");
        storedData = x;
        emit dataStored(x, msg.sender);
    }

    function get() public view returns (uint) {
        return storedData;
    }
}