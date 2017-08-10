<template>
	<div>
		<assignments-view></assignments-view>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import AssignmentsView from './AssignmentsView.vue'

	@Component({
		components: {
			'assignments-view': AssignmentsView
		}
	})
	export default class TeacherHome extends Vue {}
</script>