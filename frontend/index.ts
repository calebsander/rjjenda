import Vue from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'
import VueRouter from 'vue-router'
import AdminView from './components/AdminView.vue'
import AdvisorView from './components/AdvisorView.vue'
import CheckLoggedInComponent from './components/CheckLoggedInComponent.vue'
import LoginComponent from './components/Login.vue'
import StudentHome from './components/StudentHome.vue'
import StudentView from './components/StudentView.vue'
import TeacherHome from './components/TeacherHome.vue'
import TeacherView from './components/TeacherView.vue'

Vue.use(VueMaterial)
Vue.use(VueRouter)

Vue.material.registerTheme('default', {
	primary: 'red',
	accent: 'purple',
	warn: 'orange',
	background: 'white'
})

const routes = [
	{path: '/', component: CheckLoggedInComponent},
	{path: '/login', component: LoginComponent},
	{path: '/student', component: StudentView, children: [
		{path: '', redirect: 'home'},
		{path: 'home', component: StudentHome}
	]},
	{path: '/teacher', component: TeacherView, children: [
		{path: '', redirect: 'home'},
		{path: 'home', component: TeacherHome},
		{path: 'advisor', component: AdvisorView},
		{path: 'admin', component: AdminView}
	]}
]
const router = new VueRouter({
	mode: 'history',
	routes
})

new Vue({
	el: '#app',
	router
})