<template>
	<div>
		<md-layout>
			<md-layout md-flex=65>
				<user-csv-upload class='card'></user-csv-upload>
				<manage-students class='card'></manage-students>
			</md-layout>
			<md-layout md-flex=35>
				<group-member-csv-upload class='card'></group-member-csv-upload>
				<manage-groups class='card'></manage-groups>
			</md-layout>
		</md-layout>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import GroupMemberCSVUpload from './GroupMemberCSVUpload.vue'
	import ManageGroups from './ManageGroups.vue'
	import ManageStudents from './ManageStudents.vue'
	import UserCSVUpload from './UserCSVUpload.vue'

	@Component({
		components: {
			'group-member-csv-upload': GroupMemberCSVUpload,
			'manage-groups': ManageGroups,
			'manage-students': ManageStudents,
			'user-csv-upload': UserCSVUpload
		}
	})
	export default class AdminView extends Vue {}
</script>

<style lang='sass' scoped>
	.card
		flex-grow: 1
</style>