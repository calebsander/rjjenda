import {Instance} from 'sequelize'
import {SectionInstance} from './section'
import {StudentInstance} from './student'

export interface GroupAttributes {
	sectionId: number | null
	name: string | null //null if associated with a section, because name is in the course + section number
}

export interface GroupInstance extends Instance<GroupAttributes>, GroupAttributes {
	id: number //arbitrary
	section: SectionInstance | null //null if not associated with a section
	setStudents(students: StudentInstance[]): Promise<void>
}