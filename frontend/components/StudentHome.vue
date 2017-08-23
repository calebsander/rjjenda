<template>
	<div>
		<assignments-view ref='assignments' :teacher='false'></assignments-view>
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
	export default class StudentHome extends Vue {
		mounted() {
			const assignments = this.$refs.assignments as AssignmentsView
			apiFetch({
				url: '/assignments/my-classes',
				handler: (groups: AssignmentGroup[]) =>
					assignments.addGroups(groups),
				router: this.$router
			})
		}
	}
</script>