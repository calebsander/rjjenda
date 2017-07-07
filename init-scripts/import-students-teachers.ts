#!/usr/bin/env node

import importFromCSV from '../server/csv-import/students-and-teachers'
import * as fs from 'fs'
import {Student, Teacher} from '../server/models'

const [_, __, csvFile] = process.argv
Promise.all([
	//Because this is only being used for the initial import, we should clear the database
	Student.destroy({where: {}}),
	Teacher.destroy({where: {}})
])
	.then(() => importFromCSV(fs.createReadStream(csvFile)))
	.then(() => console.log('Done'))