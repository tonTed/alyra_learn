const Grade = artifacts.require("../contracts/Grade.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

function expect_int(arg1, arg2){
	expect(new BN(arg1)).to.be.bignumber.equal(new BN(arg2));
}

contract('Grade', accounts => {
	const owner = accounts[0];
	const _name = "Cyril";
	const _grade = 10;
	const _at = '0xBF2C49df4a77f583C06A190ff71dD153FD84000a';
	let GradeInstance;
	
	
	// TODO setter and getter only test together.
	describe.skip('With one student set', () => {
		before(async () => {
			console.log("Creating Grade Instance, Setting a student and create getting the student");
			GradeInstance = await Grade.new({from:owner});
			await GradeInstance.setStudent(_name, _grade, _at, { from: owner });
			student_array = await GradeInstance.students_array(0, { from: owner });
			student_mapping = await GradeInstance.students_mapping(_at, { from: owner });
		});
		describe('should be grade 10:', () => {
			it("students_array(0)", () => {
				// expect_int(student_array.grade, _grade);
				expect(new BN(student_array.grade)).to.be.bignumber.equal(new BN(_grade));
			});
			it("getStudentInArray(0)", async () => {
				expect((await GradeInstance.getStudentInArray(_name, {from: owner})).grade).to.be.bignumber.equal(new BN(_grade));
			});
			it(`students_mapping(${_at})`, () => {
				expect(new BN(student_mapping.grade)).to.be.bignumber.equal(new BN(_grade));
			});
			it(`getStudentMapping(${_at})`, async () => {
				expect((await GradeInstance.getStudentMapping(_at, {from: owner})).grade).to.be.bignumber.equal(new BN(_grade));
			});
		})
		describe(`should be name ${_name}:`, () => {
			it("students_array(0)", () => {
				expect(student_array.name).to.equal(_name);
			});
			it("getStudentInArray(0)", async () => {
				expect((await GradeInstance.getStudentInArray(_name, {from: owner})).name).to.equal(_name);
			});
			it(`students_mapping(${_at})`, () => {
				expect(student_mapping.name).to.equal(_name);
			});
			it(`getStudentMapping(${_at})`, async () => {
				expect((await GradeInstance.getStudentMapping(_at, {from: owner})).name).equal(_name);
			});
		})
		describe('Trying set existing student', () => {
			it("revert: 'Student already exists'", async () =>{
				await expectRevert(GradeInstance.setStudent(_name, _grade, _at, { from: owner }), "Student already exists");
			})
			it("revert: 'Student address already exists'", async () =>{
				await expectRevert(GradeInstance.setStudent("toto", _grade, _at, { from: owner }), "Student address already exists");
			})
		})
		describe('Deleting student', () => {
			before(async () => {
				await GradeInstance.deleteStudent(_at, {from: owner});
			})
			it("revert: student not exists", async () => {
				await expectRevert(GradeInstance.getStudentMapping(_at, {from: owner}), "student not exists");
			})
			//TODO voir param 0
			it("revert: student not exists with getStudentInArray(0)", async () => {
				await expectRevert(GradeInstance.getStudentInArray("Cyril", {from: owner}), "student not exists");
			})
		})
	})
});

// const objet = await this Instance.objects(param);
// expect(object.value).to.be.x;