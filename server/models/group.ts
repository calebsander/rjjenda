import {Instance} from 'sequelize'
import {SectionInstance} from './section'

export interface GroupAttributes {
	id: number //arbitrary
	section: SectionInstance | null //null if not associated with a section
	name: string | null //null if associated with a section, because name is in the course + section number
}

export interface GroupInstance extends Instance<GroupAttributes> {}