<template>
	<md-layout md-align='center'>
		<md-layout md-flex md-column md-vertical-align='center'>
			<div v-if='loading'>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
			</div>
			<div v-else>
				<md-layout class='center'>
					You have signed out
				</md-layout>
				<md-layout class='center'>
					<router-link tag='md-button' to='/login' class='md-raised md-primary'>
						Sign in
					</router-link>
				</md-layout>
			</div>
		</md-layout>
	</md-layout>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'

	@Component
	export default class Logout extends Vue {
		loading = true

		mounted() {
			apiFetch({
				url: '/logout',
				handler: () => this.loading = false,
				router: this.$router
			})
		}
	}
</script>

<style lang='sass' scoped>
	.md-layout.center
		justify-content: center
</style>