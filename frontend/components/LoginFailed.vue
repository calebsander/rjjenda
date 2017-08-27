<template>
	<md-layout md-align='center'>
		<md-layout md-flex md-column md-vertical-align='center'>
			<div>
				<md-layout class='center'>
					Login failed. Make sure you're using a {{ emailDomain }} e-mail address.
				</md-layout>
				<md-layout class='center'>
					<router-link tag='md-button' to='/login' class='md-raised md-primary'>
						Return to sign in
					</router-link>
				</md-layout>
			</div>
		</md-layout>
	</md-layout>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'

	const {emailDomain} = require('../../settings.json')

	@Component
	export default class LoginFailed extends Vue {
		emailDomain: string = emailDomain
	}
</script>

<style lang='sass' scoped>
	.md-layout.center
		justify-content: center
</style>