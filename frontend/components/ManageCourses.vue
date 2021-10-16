<template>
	<div>
		<md-table-card id='courses-table'>
			<md-toolbar>
				<h1 class='md-title'>Courses</h1>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
				<md-button class='md-raised md-icon-button' @click='newCourse' id='new-course'>
					<md-icon>add</md-icon>
					<md-tooltip md-direction='left'>Create a new course</md-tooltip>
				</md-button>
			</md-toolbar>
			<md-table>
				<md-table-header>
					<md-table-row>
						<md-table-head>ID</md-table-head>
						<md-table-head>Name</md-table-head>
						<md-table-head>Sections</md-table-head>
						<md-table-head>Delete</md-table-head>
					</md-table-row>
				</md-table-header>
				<md-table-body>
					<md-table-row v-for='course in coursesSlice' :key='course.id'>
						<md-table-cell>
							{{ course.id }}
						</md-table-cell>
						<md-table-cell @click.native='editName(course)'>
							{{ course.name }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell @click.native='editSections(course)'>
							{{ course.sections.length }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell>
							<md-button class='md-icon-button md-raised' @click='deleteCourse(course)'>
								<md-icon>delete</md-icon>
							</md-button>
						</md-table-cell>
					</md-table-row>
				</md-table-body>
			</md-table>
			<md-table-pagination
				:md-size='DEFAULT_PAGINATION'
				:md-total='courses.length'
				:md-page-options='[DEFAULT_PAGINATION]'
				@pagination='paginate'
			>
			</md-table-pagination>
		</md-table-card>

		<md-dialog ref='editName' md-open-from='#courses-table' md-close-to='#courses-table'>
			<md-dialog-title v-if='editCourse'> <!--avoid computations if editCourse == null-->
				Editing name of {{ editCourse.name }}
			</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Name</label>
					<md-input v-model='name' required ref='name'></md-input>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='saveName'>Save</md-button>
				<md-button class='md-primary' @click='cancelName'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>

		<md-dialog ref='editSections' md-open-from='#courses-table' md-close-to='#courses-table'>
			<div v-if='editCourse'> <!--avoid computations if editCourse == null-->
				<md-dialog-title v-if='editCourse'>
					Editing sections of {{ editCourse.name }}
				</md-dialog-title>
				<md-dialog-content>
					<md-list>
						<md-list-item>
							<md-input-container>
								<label>Section number</label>
								<md-input v-model='newSection' type='number' ref='newSection'></md-input>
							</md-input-container>
							<md-button class='md-raised md-icon-button' @click='addSection'>
								<md-icon>add</md-icon>
								<md-tooltip>Add section</md-tooltip>
							</md-button>
						</md-list-item>
						<md-list-item v-for='(section, sectionIndex) in editCourse.sections' :key='section'>
							{{ section }}
							<md-button class='md-raised md-icon-button' @click='deleteSection(sectionIndex)'>
								<md-icon>delete</md-icon>
								<md-tooltip>Remove section</md-tooltip>
							</md-button>
						</md-list-item>
					</md-list>
				</md-dialog-content>
			</div>
		</md-dialog>

		<md-dialog ref='newCourse' md-open-from='#new-course' md-close-to='#new-course'>
			<md-dialog-title>New course</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>ID (e.g "101")</label>
					<md-input v-model='newId' required ref='newId'></md-input>
				</md-input-container>
				<md-input-container>
					<label>Name</label>
					<md-input v-model='newName' required></md-input>
				</md-input-container>
				<md-input-container>
					<label>Number of sections</label>
					<md-input v-model='newSectionCount' type='number' required></md-input>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='create'>Create</md-button>
				<md-button class='md-primary' @click='cancelCreation'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'
	import {Course, NewCourse, NewCourseName} from '../../api'
	import {UPDATE_GROUPS} from '../admin-update-events'

	interface PaginationOptions {
		page: number
		size: number
	}
	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	@Component({
		name: 'manage-courses'
	})
	export default class ManageCourses extends Vue {
		readonly DEFAULT_PAGINATION = 10
		courses: Course[] = []
		coursesSlice: Course[] = []
		loading = true

		page: number = 1
		size: number = this.DEFAULT_PAGINATION

		editCourse: Course | null = null
		name = ''
		newSection: number = 1

		newId = ''
		newName = ''
		newSectionCount = 1

		mounted() {
			this.loadCourses()
		}
		loadCourses() {
			this.loading = true
			apiFetch({
				url: '/admin/courses',
				handler: (courses: Course[]) => {
					this.courses = courses
					this.paginate(this) //stay on current page after reload
					this.loading = false
				},
				router: this.$router
			})
		}
		getPageStart({page, size}: PaginationOptions) {
			return (page - 1) * size
		}
		paginate({page, size}: PaginationOptions) {
			this.coursesSlice = this.courses.slice(this.getPageStart({page, size}), page * size)
			this.page = page
			this.size = size
		}
		editName(course: Course) {
			this.editCourse = course
			this.name = course.name
			;(this.$refs.editName as Dialog).open()
			setTimeout(() => {
				const element = (this.$refs.name as Vue).$el
				;(element as HTMLElement).focus()
			}, 0)
		}
		saveName() {
			const course = this.editCourse as Course
			const {name} = this
			if (name === course.name) {
				alert("Name hasn't changed")
				return
			}

			const data: NewCourseName = {
				id: course.id,
				name
			}
			this.loading = true
			apiFetch({
				url: '/admin/course/set-name',
				data,
				handler: () => {
					(this.$refs.editName as Dialog).close()
					this.loading = false
					course.name = name
					this.$emit(UPDATE_GROUPS)
				},
				router: this.$router
			})
		}
		cancelName() {
			(this.$refs.editName as Dialog).close()
		}
		suggestNewSection() {
			const course = this.editCourse as Course
			let maxSection = null
			for (const section of course.sections) {
				if (maxSection === null || section > maxSection) maxSection = section
			}
			if (maxSection === null) this.newSection = 1
			else this.newSection = maxSection + 1
		}
		editSections(course: Course) {
			this.editCourse = course
			this.suggestNewSection()
			;(this.$refs.editSections as Dialog).open()
			setTimeout(() => {
				const element = (this.$refs.newSection as Vue).$el
				;(element as HTMLElement).focus()
			}, 0)
		}
		addSection() {
			const course = this.editCourse as Course
			this.newSection = Number(this.newSection) //not sure why Vue Material makes this a string
			if (course.sections.indexOf(this.newSection) !== -1) { //section already exists
				alert('Section ' + String(this.newSection) + ' already exists')
				return
			}

			this.loading = true
			apiFetch({
				url: '/admin/new-section/' + course.id + '/' + String(this.newSection),
				handler: () => {
					this.loading = false
					course.sections.push(this.newSection)
					this.suggestNewSection()
					this.$emit(UPDATE_GROUPS)
				},
				router: this.$router
			})
		}
		deleteSection(sectionIndex: number) {
			const course = this.editCourse as Course
			const section = course.sections[sectionIndex]
			this.loading = true
			apiFetch({
				url: '/admin/section/' + course.id + '/' + String(section),
				method: 'DELETE',
				handler: () => {
					this.loading = false
					course.sections.splice(sectionIndex, 1)
					this.suggestNewSection()
					this.$emit(UPDATE_GROUPS)
				},
				router: this.$router
			})
		}
		newCourse() {
			this.newId = ''
			this.newName = ''
			this.newSectionCount = 1
			;(this.$refs.newCourse as Dialog).open()
			setTimeout(() => {
				const element = (this.$refs.newId as Vue).$el
				;(element as HTMLElement).focus()
			}, 0)
		}
		create() {
			if (!this.newId) {
				alert('No course ID given')
				return
			}
			if (!this.newName) {
				alert('No name given')
				return
			}

			const id = this.newId
			const name = this.newName
			const sectionCount = this.newSectionCount
			const sections: number[] = []
			for (let section = 1; section <= sectionCount; section++) sections.push(section)
			const data: NewCourse = {
				id,
				name,
				sectionCount
			}
			this.loading = true
			apiFetch({
				url: '/admin/course',
				data,
				handler: () => {
					(this.$refs.newCourse as Dialog).close()
					this.loading = false
					this.courses.splice(this.getPageStart(this), 0, { //add course to top of page
						id,
						name,
						sections
					})
					this.paginate(this)
					this.$emit(UPDATE_GROUPS)
				},
				router: this.$router
			})
		}
		cancelCreation() {
			(this.$refs.newCourse as Dialog).close()
		}
		deleteCourse(course: Course) {
			this.loading = true
			apiFetch({
				url: '/admin/course/' + course.id,
				method: 'DELETE',
				handler: () => {
					this.loading = false
					const courseIndex = this.courses.indexOf(course)
					this.courses.splice(courseIndex, 1)
					this.paginate(this)
					if (course.sections.length) this.$emit(UPDATE_GROUPS)
				},
				router: this.$router
			})
		}
	}
</script>