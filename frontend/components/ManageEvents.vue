<template>
	<div>
		<md-table-card>
			<md-toolbar>
				<h1 class='md-title'>Events</h1>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
				<md-button class='md-raised md-icon-button' @click='newEvent' id='new-event'>
					<md-icon>add</md-icon>
					<md-tooltip md-direction='left'>Create a new event</md-tooltip>
				</md-button>
			</md-toolbar>
			<date-input v-model='searchStart' label='From'></date-input>
			<date-input v-model='searchEnd' label='To'></date-input>
			<md-button class='md-raised' @click='loadEvents'>Load events</md-button>
			<md-table>
				<md-table-header>
					<md-table-row>
						<md-table-head>Name</md-table-head>
						<md-table-head>Starts on</md-table-head>
						<md-table-head>Continues through</md-table-head>
						<md-table-head>Delete</md-table-head>
					</md-table-row>
				</md-table-header>
				<md-table-body v-if='events.length'>
					<md-table-row v-for='event in events' :key='event.id'>
						<md-table-cell>
							{{ event.name }}
						</md-table-cell>
						<md-table-cell>
							{{ getDateOf(event.start) }}
						</md-table-cell>
						<md-table-cell>
							{{ getDateOf(event.end - 1) }}
						</md-table-cell>
						<md-table-cell>
							<md-button class='md-icon-button md-raised' @click='deleteEvent(event)'>
								<md-icon>delete</md-icon>
							</md-button>
						</md-table-cell>
					</md-table-row>
				</md-table-body>
				<md-table-body v-else>
					<md-table-row>
						<md-table-cell :colspan='4'>No events in range</md-table-cell>
					</md-table-row>
				</md-table-body>
			</md-table>
		</md-table-card>

		<md-dialog ref='newEvent' md-open-from='#new-event' md-close-to='#new-event'>
			<md-dialog-title>New event</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Title</label>
					<md-input v-model='newName' required></md-input>
				</md-input-container>
				<date-input v-model='newStart' ref='newStart' label='Starts on'></date-input>
				<date-input v-model='newEnd' ref='newEnd' label='Continues through'></date-input>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='create'>Create</md-button>
				<md-button class='md-primary' @click='cancelCreation'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {EventsRequest, EventResponse, NewEvent} from '../../api'
	import apiFetch from '../api-fetch'
	import DateInput from './DateInput.vue'
	import ExtendedDate from '../../util/extended-date'

	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	@Component({
		name: 'manage-events',
		components: {
			'date-input': DateInput
		},
		watch: {
			newStart: 'updateNewEnd'
		}
	})
	export default class ManageEvents extends Vue {
		loading = false
		lastSearchStart = new Date
		lastSearchEnd = new Date
		searchStart = new Date //inclusive
		searchEnd = new ExtendedDate().addDays(30).date //inclusive
		events: EventResponse[] = []

		newName = ''
		newStart = new Date
		newEnd = new Date

		mounted() {
			this.loadEvents()
		}
		loadEvents() {
			const data: EventsRequest = {
				year: this.searchStart.getFullYear(),
				month: this.searchStart.getMonth(),
				date: this.searchStart.getDate(),
				days: new ExtendedDate(this.searchEnd)
					.daysSince(new ExtendedDate(this.searchStart)) + 1
			}
			this.lastSearchStart = this.searchStart
			this.lastSearchEnd = this.searchEnd
			this.loading = true
			apiFetch({
				url: '/events',
				data,
				handler: (events: EventResponse[]) => {
					this.loading = false
					this.events = events
				},
				router: this.$router
			})
		}
		getDateOf(dayIndex: number) {
			const {year, month, date} = new ExtendedDate(this.lastSearchStart).addDays(dayIndex - 1).toYMD()
			return [month + 1, date, year % 100].join('/')
		}
		newEvent() {
			this.newName = ''
			this.newStart = this.newEnd = new Date
			;(this.$refs.newEvent as Dialog).open()
		}
		create() {
			if (!this.newName) return alert('Please name the event')

			const {newStart, newEnd} = this
			const data: NewEvent = {
				year: newStart.getFullYear(),
				month: newStart.getMonth(),
				date: newStart.getDate(),
				days: new ExtendedDate(newEnd)
					.daysSince(new ExtendedDate(newStart)) + 1,
				name: this.newName
			}
			this.loading = true
			apiFetch({
				url: '/admin/new-event',
				data,
				handler: () => {
					this.loading = false
					this.cancelCreation()
					const updateSearch = this.lastSearchStart &&
						newStart <= this.lastSearchEnd! &&
						newEnd >= this.lastSearchStart
					if (updateSearch) this.loadEvents()
				},
				router: this.$router
			})
		}
		cancelCreation() {
			(this.$refs.newEvent as Dialog).close()
		}
		deleteEvent(event: EventResponse) {
			const {id} = event
			this.loading = true
			apiFetch({
				url: '/admin/event/' + String(id),
				method: 'DELETE',
				handler: () => {
					this.loading = false
					this.events.splice(this.events.indexOf(event), 1)
				},
				router: this.$router
			})
		}
		updateNewEnd() {
			if (this.newStart > this.newEnd) this.newEnd = this.newStart
		}
	}
</script>