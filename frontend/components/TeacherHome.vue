<template>
	<div>
		<assignments-view ref='assignments' :teacher='true'></assignments-view>
		<md-button class='md-raised' @click='loadMyGroups'>Show my sections</md-button>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {AssignmentGroup} from '../../api'
	import apiFetch from '../api-fetch'
	import AssignmentsView from './AssignmentsView.vue'

	@Component({
		components: {
			'assignments-view': AssignmentsView
		}
	})
	export default class TeacherHome extends Vue {
		myGroups: AssignmentGroup[] = []

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
			(this.$refs.assignments as AssignmentsView).setGroups(this.myGroups)
		}
	}
</script>