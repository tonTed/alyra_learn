// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

contract parent {
	string state;

	function changeState(string calldata _state) public {
		state = _state;
	}
}

contract enfant is parent {

	function getStateParent() public view returns (string memory) {
		return(state);
	}
}

