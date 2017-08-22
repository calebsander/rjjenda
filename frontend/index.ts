import Vue from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'
import VueRouter from 'vue-router'
import AdminView from './components/AdminView.vue'
import AdvisorView from './components/AdvisorView.vue'
import CheckLoggedIn from './components/CheckLoggedIn.vue'
import Login from './components/Login.vue'
import Logout from './components/Logout.vue'
import StudentHome from './components/StudentHome.vue'
import StudentView from './components/StudentView.vue'
import TeacherHome from './components/TeacherHome.vue'
import TeacherView from './components/TeacherView.vue'

Vue.use(VueMaterial)
Vue.use(VueRouter)

Vue.material.registerTheme('default', {
	primary: {
		color: 'red',
		hue: 900
	},
	accent: 'purple',
	warn: 'orange',
	background: 'white'
})

const routes = [
	{path: '/', component: CheckLoggedIn},
	{path: '/login', component: Login},
	{path: '/student', component: StudentView, children: [
		{path: '', redirect: 'home'},
		{path: 'home', component: StudentHome}
	]},
	{path: '/teacher', component: TeacherView, children: [
		{path: '', redirect: 'home'},
		{path: 'home', component: TeacherHome},
		{path: 'advisor', component: AdvisorView},
		{path: 'admin', component: AdminView}
	]},
	{path: '/logout', component: Logout}
]
const router = new VueRouter({
	mode: 'history',
	routes
})

new Vue({
	el: '#app',
	router
})