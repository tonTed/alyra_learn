// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

contract Whitelist {
   mapping(address=> addressStatus) whitelist;

   event Authorized(address _address); // Event
   event BlackListed(address _address); // Event

   enum addressStatus{Default, Blacklist, Whitelist}

   address admin;

	addressStatus status;
	addressStatus constant defaultStatus = addressStatus.Default;
 
	function authorize(address _address, addressStatus _status) public {
		require(admin == msg.sender, "you are not the admin!");
		if (_status == addressStatus.Blacklist) {
			emit BlackListed(msg.sender);
		}
		else{
			emit Authorized(_address); // Triggering event
		}
		whitelist[_address] = _status;
   }
}