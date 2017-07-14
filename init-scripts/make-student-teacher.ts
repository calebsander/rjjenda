#!/usr/bin/env node

import {Student, Teacher, sequelize} from '../server/models'

const username = process.argv[2]
if (!username) throw new Error('Syntax: "init-scripts/make-student-teacher.js username"')

Student.findOne({
	where: {username}
})
	.then(student => {
		if (student === null) throw new Error('No such username: ' + username)
		const teacherId = student.id.replace('S', 'T')
		return Teacher.create({
			id: teacherId,
			firstName: student.firstName,
			lastName: student.lastName,
			username,
			admin: false,
			admissions: false
		})
			.then(() => student.destroy())
	})
	.then(() => sequelize.close())
	.catch(err => {
		sequelize.close()
		throw err
	})