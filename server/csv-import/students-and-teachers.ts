import {parse, RowObject} from './csv-parse'
import {Readable} from 'stream'
import {Student, Teacher} from '../models'

interface Person extends RowObject {
	'User ID': string
	'Last Name': string
	'First Name': string
	'Email ID': string
	'Role(s)': string
	'Grade Level': string
}

export default (csvStream: Readable): Promise<any> =>
	parse(csvStream)
		.then(rows => {
			const people = rows as Person[]
			return Promise.all(people.map((person): PromiseLike<any> => {
				const {
					'User ID': id,
					'Last Name': lastName,
					'First Name': firstName,
					'Email ID': email,
					'Role(s)': role,
					'Grade Level': year
				} = person
				const username = email.substring(0, email.indexOf('@')).toLowerCase()
				switch (role) {
					case 'Student':
						return Student.findOrCreate({
							where: {id},
							defaults: {
								id,
								firstName,
								lastName,
								username,
								advisor: null,
								year: Number(year)
							}
						})
					case 'Staff':
					case 'Teacher':
						return Teacher.findOrCreate({
							where: {id},
							defaults: {
								id,
								firstName,
								lastName,
								username,
								admin: false,
								admissions: false
							}
						})
					default:
						throw new Error('Unknown role: ' + role)
				}
			}))
		})