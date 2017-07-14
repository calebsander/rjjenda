<template>
	<div>
		<md-layout>
			<md-layout md-flex=33></md-layout>
			<md-layout md-flex=33>
				<user-csv-upload></user-csv-upload>
			</md-layout>
			<md-layout md-flex=33></md-layout>
		</md-layout>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import UserCSVUpload from './UserCSVUpload.vue'

	@Component({
		components: {'user-csv-upload': UserCSVUpload}
	})
	export default class AdminView extends Vue {}
</script>