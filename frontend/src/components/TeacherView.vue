<template>
	<div>
		<md-toolbar>
			<md-button class='md-icon-button' @click='toggleSidebar'>
				<md-icon>menu</md-icon>
			</md-button>
			<h2 class='md-title' v-if='teacher'>
				Welcome, {{ teacher.name }}
			</h2>
		</md-toolbar>
		<md-sidenav class='md-left' ref='sidebar'>
			<md-toolbar>
				<div class='md-toolbar-container'>
					<h3 class='md-title'>Teacher Options</h3>
				</div>
			</md-toolbar>
			<md-list>
				<md-list-item>
					<router-link to='/teacher/home' @click.native='toggleSidebar'>
						<md-icon>home</md-icon>
						Home
					</router-link>
				</md-list-item>
				<md-list-item v-if='teacher && teacher.admin'>
					<router-link to='/teacher/admin' @click.native='toggleSidebar'>
						<md-icon>settings</md-icon>
						Admin
					</router-link>
				</md-list-item>
			</md-list>
		</md-sidenav>

		<router-view></router-view>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'
	import {UserInfo} from '../../../api'

	interface Sidebar extends Vue {
		toggle(): void
	}

	@Component
	export default class TeacherView extends Vue {
		teacher: UserInfo | null = null

		mounted() {
			apiFetch({
				url: '/user-info',
				handler: (response: UserInfo) => {
					this.teacher = response
				},
				router: this.$router
			})
		}
		toggleSidebar() {
			(this.$refs.sidebar as Sidebar).toggle()
		}
	}
</script>
