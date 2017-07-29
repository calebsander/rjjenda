<template>
	<div>
		<md-table-card id='students-table'>
			<md-toolbar>
				<h1 class='md-title'>Courses</h1>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
				<md-button class='md-raised md-icon-button' @click='newCourse' id='new-course'>
					<md-icon>add</md-icon>
					<md-tooltip>Create a new course</md-tooltip>
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
			<md-dialog-title v-if='editCourse'> <!--Avoid computations if editCourse == null-->
				Editing name of {{ editCourse.name }}
			</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Name</label>
					<md-input v-model='name'></md-input>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='saveName'>Save</md-button>
				<md-button class='md-primary' @click='cancelName'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>

		<md-dialog ref='newCourse' md-open-from='#new-course' md-close-to='#new-course'>
			<md-dialog-title>New course</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>ID (e.g "101")</label>
					<md-input v-model='newId' required></md-input>
				</md-input-container>
				<md-input-container>
					<label>Name</label>
					<md-input v-model='newName' required></md-input>
				</md-input-container>
				<md-input-container>
					<label>Sections</label>
					<md-input v-model='newSections' type='number' required></md-input>
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
	import {Course} from '../../../api'

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

		newId = ''
		newName = ''
		newSections = 1

		mounted() {
			this.loadCourses()
		}
		loadCourses() {
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
		}
		saveName() {}
		cancelName() {
			(this.$refs.editName as Dialog).close()
		}
		editSections(course: Course) {}
		saveSections() {}
		cancelSections() {}
		newCourse() {
			this.newId = ''
			this.newName = ''
			this.newSections = 1
			;(this.$refs.newCourse as Dialog).open()
		}
		create() {}
		cancelCreation() {
			(this.$refs.newCourse as Dialog).close()
		}
		deleteCourse(course: Course) {}
	}
</script>