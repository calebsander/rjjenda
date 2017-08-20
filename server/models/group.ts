import {Instance} from 'sequelize'
import {AssignmentInstance} from './assignment'
import {SectionInstance} from './section'
import {StudentInstance} from './student'

export interface GroupAttributes {
	id?: number //arbitrary
	sectionId: number | null
	name: string | null //null if associated with a section, because name is in the course + section number
}

export interface GroupInstance extends Instance<GroupAttributes>, GroupAttributes {
	section: SectionInstance | null //null if not associated with a section
	students?: StudentInstance[]
	assignments?: AssignmentInstance[]
	studentCount?: number
	setStudents(students: StudentInstance[]): Promise<void>
	addStudent(student: StudentInstance): Promise<void>
	removeStudent(student: StudentInstance): Promise<void>
}