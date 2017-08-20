<template>
	<div>
		<assignments-view ref='assignments' :teacher='true'></assignments-view>
		<md-button class='md-raised' @click='loadMyGroups'>Show my sections</md-button>
		<md-button class='md-raised' @click='selectTeacher'>Show another teacher's sections</md-button>

		<teacher-selector ref='teacherSelector' @save='loadTeacher' :teachers='teachers'></teacher-selector>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {AssignmentGroup, TeachersList} from '../../api'
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
		myGroups: AssignmentGroup[] = []
		teachers: TeachersList = []

		mounted() {
			apiFetch({
				url: '/assignments/my-sections',
				handler: (groups: AssignmentGroup[]) => {
					this.myGroups = groups
					this.loadMyGroups()
				},
				router: this.$router
			})
		}
		loadMyGroups() {
			this.loadGroups(this.myGroups)
		}
		loadGroups(groups: AssignmentGroup[]) {
			(this.$refs.assignments as AssignmentsView).setGroups(groups)
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
	}
</script>