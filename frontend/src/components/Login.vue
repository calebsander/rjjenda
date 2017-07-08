<template>
	<div>
		<md-button class='md-raised md-accent' @click.native='increment'>
			Increment
		</md-button>
		{{ count }}
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'

	@Component
	export default class LoginComponent extends Vue {
		count: number = 0

		increment(): void {
			this.count++
		}
	}
</script>