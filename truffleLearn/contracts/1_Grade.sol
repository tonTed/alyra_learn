// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract Grade {
	struct Student {
		string name;
		uint8 grade;
	}

	uint public test;

	mapping (address => Student) public students_mapping;
	Student[] public students_array;

	function _strcmp(string memory s1, string memory s2) private pure returns (bool){
		if (keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2))){
			return (true);
		}
		return (false);
	}

	function _emptryString(string memory _s) private pure returns (bool){
        return bytes(_s).length == 0;
	}

	function _studentAlreadyExists(string memory _name) private view returns (bool) {
		for (uint i = students_array.length; i > 0; i--){
			if (_strcmp(students_array[i - 1].name , _name)){
				return (true);
			}
		}
		return (false);
	}

	function setStudent(string calldata _name, uint8 _grade, address _at) external {
		require(!_studentAlreadyExists(_name), "Student already exists");
		require(_strcmp(students_mapping[_at].name, ""), "Student address already exists");
		students_array.push(Student(_name, _grade));
		students_mapping[_at].name = _name;
		students_mapping[_at].grade = _grade;
	}
	
	function deleteStudent(address _at) external {
		for (uint i = students_array.length; i > 0; i--){
			if (_strcmp(students_array[i - 1].name, students_mapping[_at].name)){
				delete students_array[i - 1];
			}
		}
		students_mapping[_at].name = "";
		students_mapping[_at].grade = 0;
	}

	function getStudentInArray(string calldata _name) external view returns (Student memory){
		for (uint i = students_array.length; i > 0; i--){
			if (_strcmp(students_array[i - 1].name, _name)){
				return (students_array[i - 1]);
			}
		}
		revert("student not exists");
	}

	function getStudentMapping(address _at) external view returns (Student memory){
		require(!_strcmp(students_mapping[_at].name, ""), "student not exists");
		return (students_mapping[_at]);
	}
}