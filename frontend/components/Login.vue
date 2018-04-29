<template>
	<div id="sign-in">
		<md-card md-with-hover>
			<md-card-header>
				<div class="md-title">RJJenda</div>
				<div class="md-subhead">Commonwealth Workload Manager</div>
			</md-card-header>

			<md-card-media>
				<img src="/assets/login-photo.jpg" alt="People">
			</md-card-media>

			<md-card-content>
				Please use your Commonwealth Google account to sign into the workload manager.
			</md-card-content>

			<md-card-actions>
				<md-button href='/auth'>Sign in with Google</md-button>
			</md-card-actions>
		</md-card>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'

	@Component
	export default class LoginComponent extends Vue {}
</script>

<style lang="sass">
	body
		background: darkred !important
	#sign-in
		display: flex
	#sign-in > div
		margin: auto
		margin-top: 100px
		width: 450px
</style>