<template>
	<div>
		<assignments-view ref='assignments' teacher></assignments-view>
		<div v-if='admin'>
			<md-button class='md-raised' @click='loadMyGroups'>Show my sections</md-button>
			<md-button class='md-raised' @click='selectTeacher'>Show another teacher's sections</md-button>
			<md-button class='md-raised' @click='selectCourse'>Show all sections for a course</md-button>
		</div>

		<teacher-selector ref='teacherSelector' @save='loadTeacher' :teachers='teachers'></teacher-selector>
		<md-dialog ref='courseSelector'>
			<md-dialog-title>Select course</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Course</label>
					<md-select v-model='selectedCourse' required>
						<md-option v-for='course in courses' :value='course.id' :key='course.id'>
							{{ course.id }} - {{ course.name }}
						</md-option>
					</md-select>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='loadCourse'>Load</md-button>
				<md-button class='md-primary' @click='cancelCourse'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {AssignmentGroup, CourseList, TeachersList} from '../../api'
	import apiFetch from '../api-fetch'
	import AssignmentsView from './AssignmentsView.vue'
	import TeacherSelector from './TeacherSelector.vue'

	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	@Component({
		components: {
			'assignments-view': AssignmentsView,
			'teacher-selector': TeacherSelector
		}
	})
	export default class TeacherHome extends Vue {
		teachers: TeachersList = []
		selectedCourse: string = ''
		courses: CourseList = []
		admin = false

		mounted() {
			apiFetch({
				url: '/assignments/my-displayed',
				handler: (groups: AssignmentGroup[]) => this.loadGroups(groups),
				router: this.$router
			})
			apiFetch({
				url: '/assignments/all-school',
				handler: (group: AssignmentGroup) =>
					(this.$refs.assignments as AssignmentsView).setAllStudentsGroup(group),
				router: this.$router
			})
			apiFetch({
				url: '/is/admin',
				handler: (admin: boolean) => this.admin = admin,
				router: this.$router
			})
		}
		loadMyGroups() {
			apiFetch({
				url: '/assignments/my-sections',
				handler: (groups: AssignmentGroup[]) => this.loadGroups(groups),
				router: this.$router
			})
		}
		loadGroups(groups: AssignmentGroup[]) {
			(this.$refs.assignments as AssignmentsView).addGroups(groups)
		}
		selectTeacher() {
			if (!this.teachers.length) {
				apiFetch({
					url: '/list-teachers',
					handler: (teachers: TeachersList) => this.teachers = teachers,
					router: this.$router
				})
			}
			(this.$refs.teacherSelector as Dialog).open()
		}
		loadTeacher(teacherId: string) {
			apiFetch({
				url: '/assignments/teacher-sections/' + teacherId,
				handler: (groups: AssignmentGroup[]) => this.loadGroups(groups),
				router: this.$router
			})
		}
		selectCourse() {
			if (!this.courses.length) {
				this.courses = [{id: '', name: ''}]
				apiFetch({
					url: '/assignments/list-courses',
					handler: (courses: CourseList) => this.courses.push(...courses),
					router: this.$router
				})
			}
			this.selectedCourse = ''
			;(this.$refs.courseSelector as Dialog).open()
		}
		cancelCourse() {
			(this.$refs.courseSelector as Dialog).close()
		}
		loadCourse() {
			if (!this.selectedCourse) {
				alert('Please select a course')
				return
			}
			(this.$refs.courseSelector as Dialog).close()
			apiFetch({
				url: '/assignments/course-sections/' + this.selectedCourse,
				handler: (groups: AssignmentGroup[]) => this.loadGroups(groups),
				router: this.$router
			})
		}
	}
</script>