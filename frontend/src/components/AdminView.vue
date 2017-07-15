<template>
	<div>
		<md-layout>
			<md-layout>
				<user-csv-upload class='card'></user-csv-upload>
				<manage-students class='card'></manage-students>
			</md-layout>
			<md-layout md-flex=33></md-layout>
			<md-layout md-flex=33></md-layout>
		</md-layout>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import ManageStudents from './ManageStudents.vue'
	import UserCSVUpload from './UserCSVUpload.vue'

	@Component({
		components: {
			'manage-students': ManageStudents,
			'user-csv-upload': UserCSVUpload
		}
	})
	export default class AdminView extends Vue {}
</script>

<style lang='sass'>
	.card
		flex-grow: 1
</style>