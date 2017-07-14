<template>
	<md-layout md-align='center'>
		<md-layout md-flex md-column md-vertical-align='center'>
			<md-layout md-flex>
				<md-button href='/auth' class='md-raised md-primary'>Sign in with Google</md-button>
			</md-layout>
		</md-layout>
	</md-layout>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'

	@Component
	export default class LoginComponent extends Vue {}
</script>