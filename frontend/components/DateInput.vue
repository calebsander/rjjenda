<template>
	<md-input-container>
		<label>{{ label }}</label>
		<md-input v-model='month' type='number' :min='1' :max='12' required placeholder='M'></md-input>
		<span class='slash'>/</span>
		<md-input v-model='date' type='number' :min='1' :max='31' required placeholder='D'></md-input>
		<span class='slash'>/</span>
		<md-input v-model='year' type='number' required placeholder='Y'></md-input>
	</md-input-container>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'

	@Component({
		name: 'date-input',
		props: {
			value: Date,
			label: String
		},
		watch: {
			value: 'updateValue',
			year: 'change',
			month: 'change',
			date: 'change'
		}
	})
	export default class DateInput extends Vue {
		value!: Date
		year: number | string = 2000 //given random values so they are defined
		month: number | string = 1 //human-readable (1-12)
		date: number | string = 1

		mounted() {
			this.updateValue()
		}
		updateValue() {
			this.year = this.value.getFullYear()
			this.month = this.value.getMonth() + 1
			this.date = this.value.getDate()
		}
		change() {
			if (this.year === '' || this.year < 2000 || this.month === '' || this.date === '') return //in the process of typing

			this.$emit('input', new Date(
				Number(this.year), //values sometimes come in as strings
				Number(this.month) - 1,
				Number(this.date)
			))
		}
	}
</script>

<style lang='sass' scoped>
	span.slash
		position: relative
		top: 5px
		font-size: 30px
</style>