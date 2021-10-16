import {SectionModel} from './models/section'

export default (section: SectionModel) =>
	section.course.name + ' - section ' + String(section.number)