<template>
	<div>
		<md-toolbar>
			<md-button class='md-icon-button'>
				<md-icon>menu</md-icon>
			</md-button>
			<h2 class='md-title' v-if='student'>
				Welcome, {{ student.name }}
			</h2>
		</md-toolbar>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'
	import {UserInfo} from '../../api'

	@Component
	export default class StudentView extends Vue {
		student: UserInfo | null = null

		mounted() {
			apiFetch({
				url: '/user-info',
				handler: (response: UserInfo) => {
					this.student = response
				},
				router: this.$router
			})
		}
	}
</script>