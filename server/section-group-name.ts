import {SectionInstance} from './models/section'

export default (section: SectionInstance) =>
	section.course.name + ' - section ' + String(section.number)