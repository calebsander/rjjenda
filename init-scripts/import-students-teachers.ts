#!/usr/bin/env node

import importFromCSV from '../server/csv-import/students-and-teachers'
import * as fs from 'fs'
import {Student, Teacher, sequelize} from '../server/models'

const [_, __, csvFile] = process.argv
if (!csvFile) throw new Error('Syntax: "init-scripts/import-students-teachers.js csvFile"')

Promise.all([
	//Because this is only being used for the initial import, we should clear the database
	Student.destroy({where: {}}),
	Teacher.destroy({where: {}})
])
	.then(() => importFromCSV(fs.createReadStream(csvFile)))
	.then(() => sequelize.close())
	.catch(err => {
		sequelize.close()
		throw err
	})