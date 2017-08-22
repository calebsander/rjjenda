<template>
	<div>
		<md-spinner md-indeterminate class='md-warn'></md-spinner>
		Checking if logged in...
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'
	import {LoggedIn} from '../../api'

	@Component
	export default class CheckLoggedInComponent extends Vue {
		mounted() {
			apiFetch({
				url: '/logged-in',
				handler: (response: LoggedIn) => {
					if (response.loggedIn) this.$router.push('/' + response.type)
					else this.$router.push('/login')
				},
				router: this.$router
			})
		}
	}
</script>