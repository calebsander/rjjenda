#!/usr/bin/env node

import {Teacher, sequelize} from '../server/models'

const username = process.argv[2]
if (!username) throw new Error('Syntax: "init-scripts/set-admin.js username"')

Teacher.findOne({where: {username}, attributes: ['id']})
	.then(teacher => {
		if (teacher === null) {
			return Promise.reject(new Error('No teacher with username: ' + username))
		}
		teacher.set('admin', true)
		return teacher.save()
	})
	.then(() => sequelize.close())
	.catch(err => {
		sequelize.close()
		throw err
	})