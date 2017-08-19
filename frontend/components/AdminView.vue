<template>
	<div>
		<user-csv-upload class='card'></user-csv-upload>
		<group-member-csv-upload class='card'></group-member-csv-upload>
		<manage-students class='card' ref='students' @updateGroups='updateGroups' :teachers='teachers'></manage-students>
		<manage-teachers
			class='card'
			@updateGroups='updateGroups'
			@updateStudents='updateStudents'
			@updateTeachers='updateTeachers'
		>
		</manage-teachers>
		<manage-courses class='card' ref='courses' @updateGroups='updateGroups'></manage-courses>
		<manage-groups class='card' ref='groups' :teachers='teachers' @updateCourses='updateCourses'></manage-groups>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'
	import {TeachersList} from '../../api'
	import GroupMemberCSVUpload from './GroupMemberCSVUpload.vue'
	import ManageCourses from './ManageCourses.vue'
	import ManageGroups from './ManageGroups.vue'
	import ManageStudents from './ManageStudents.vue'
	import ManageTeachers from './ManageTeachers.vue'
	import UserCSVUpload from './UserCSVUpload.vue'

	@Component({
		components: {
			'group-member-csv-upload': GroupMemberCSVUpload,
			'manage-courses': ManageCourses,
			'manage-groups': ManageGroups,
			'manage-students': ManageStudents,
			'manage-teachers': ManageTeachers,
			'user-csv-upload': UserCSVUpload
		}
	})
	export default class AdminView extends Vue {
		teachers: TeachersList | null = null

		mounted() {
			this.updateTeachers()
		}
		updateCourses() {
			(this.$refs.courses as ManageCourses).loadCourses()
		}
		updateGroups() {
			(this.$refs.groups as ManageGroups).loadGroups()
		}
		updateStudents() {
			(this.$refs.students as ManageStudents).loadStudents()
		}
		updateTeachers() {
			apiFetch({
				url: '/admin/list-teachers',
				handler: (teachers: TeachersList) => this.teachers = teachers,
				router: this.$router
			})
		}
	}
</script>

<style lang='sass' scoped>
	.card
		flex-grow: 1
</style>
<style lang='sass'>
	.md-table-cell .md-icon
		margin-left: 10px
</style>