<template>
	<div>
		<user-csv-upload class='card'></user-csv-upload>
		<group-member-csv-upload class='card'></group-member-csv-upload>
		<manage-students class='card'></manage-students>
		<manage-teachers class='card'></manage-teachers>
		<manage-courses class='card'></manage-courses>
		<manage-groups class='card'></manage-groups>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
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
	export default class AdminView extends Vue {}
</script>

<style lang='sass' scoped>
	.card
		flex-grow: 1
</style>
<style lang='sass'>
	.md-table-cell .md-icon
		margin-left: 10px
</style>