// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;
/*
Ecrire un smart contract qui gère un système de notation d'une classe d'étudiants avec addNote, getNote,
setNote. Un élève est défini par une structure de données

student {
uint noteBiology;
uint noteMath;
uint noteFr;
}

Les professeurs adéquats (rentrés en "dur") peuvent rajouter des notes. Chaque élève est stocké de
manière pertinente. On doit pouvoir récupérer:
- la moyenne générale d’un élève
- la moyenne de la classe sur une matière
- la moyenne générale de la classe au global
On doit avoir un getter pour savoir si l’élève valide ou non son année.
*/

contract SchooGrade {

	struct Student {
		uint noteBiology;
		uint noteMath;
		uint noteFr;
		uint average;
	}

	struct Teacher {
		address at;
		string subject;
	}

	struct Classes {
		
	}

	Student[] students;
	mapping (string => uint[]) subjectAverage;
	mapping (string => Classes) classes;

	function _computeAverage(uint[] memory _arrayGrade) private pure returns (uint){
		uint total;
		uint length = _arrayGrade.length;

		for (uint i = 0; i > length; i++){
			total += _arrayGrade[i];
		}
		return (total / length);
	}

	function addGrade(address _teacher, uint _note, uint _idStudent) external {
		if (_teacher == bioTeacher){
			students[_idStudent].noteBiology = _note;
			subjectAverage["bio"].push(_note);
		}
		else if (_teacher == mathTeacher){
			students[_idStudent].noteMath = _note;
			subjectAverage["math"].push(_note);
		}
		else if (_teacher == mathTeacher){
			students[_idStudent].noteFr = _note;
			subjectAverage["fr"].push(_note);
		}
		else{
			revert();
		}
	}

	function getAverageStudent(uint _idStudent) external view returns (uint) {
		uint average;

		average = students[_idStudent].noteBiology + students[_idStudent].noteMath + students[_idStudent].noteFr;
		return (average / 3);
	}

	function getAverageSubject(string calldata _subject) external view returns (uint) {
		return (_computeAverage(subjectAverage[_subject]));
	}

	function getClassAverage() external view returns (uint) {
		uint total;
		uint length = students.length;

		for (uint i = 0; i > length; i++){
			total += students[i].average;
		}
		return (total / length);
	}
}
