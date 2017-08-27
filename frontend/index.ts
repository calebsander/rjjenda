import Vue from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/components/mdCore/index.css'
import 'vue-material/dist/components/mdBackdrop/index.css'
import 'vue-material/dist/components/mdButton/index.css'
import 'vue-material/dist/components/mdCard/index.css'
import 'vue-material/dist/components/mdCheckbox/index.css'
import 'vue-material/dist/components/mdChips/index.css'
import 'vue-material/dist/components/mdDialog/index.css'
import 'vue-material/dist/components/mdFile/index.css'
import 'vue-material/dist/components/mdIcon/index.css'
import 'vue-material/dist/components/mdInputContainer/index.css'
import 'vue-material/dist/components/mdLayout/index.css'
import 'vue-material/dist/components/mdList/index.css'
import 'vue-material/dist/components/mdMenu/index.css'
import 'vue-material/dist/components/mdSelect/index.css'
import 'vue-material/dist/components/mdSidenav/index.css'
import 'vue-material/dist/components/mdSpinner/index.css'
import 'vue-material/dist/components/mdSwitch/index.css'
import 'vue-material/dist/components/mdTable/index.css'
import 'vue-material/dist/components/mdToolbar/index.css'
import 'vue-material/dist/components/mdTooltip/index.css'
import VueRouter from 'vue-router'
import AdminView from './components/AdminView.vue'
import AdvisorView from './components/AdvisorView.vue'
import CheckLoggedIn from './components/CheckLoggedIn.vue'
import Login from './components/Login.vue'
import LoginFailed from './components/LoginFailed.vue'
import Logout from './components/Logout.vue'
import StudentHome from './components/StudentHome.vue'
import StudentView from './components/StudentView.vue'
import TeacherHome from './components/TeacherHome.vue'
import TeacherView from './components/TeacherView.vue'

Vue.use(VueMaterial.MdCore)
Vue.use(VueMaterial.MdBackdrop)
Vue.use(VueMaterial.MdButton)
Vue.use(VueMaterial.MdCard)
Vue.use(VueMaterial.MdCheckbox)
Vue.use(VueMaterial.MdChips)
Vue.use(VueMaterial.MdDialog)
Vue.use(VueMaterial.MdFile)
Vue.use(VueMaterial.MdIcon)
Vue.use(VueMaterial.MdInputContainer)
Vue.use(VueMaterial.MdLayout)
Vue.use(VueMaterial.MdList)
Vue.use(VueMaterial.MdMenu)
Vue.use(VueMaterial.MdSelect)
Vue.use(VueMaterial.MdSidenav)
Vue.use(VueMaterial.MdSpinner)
Vue.use(VueMaterial.MdSwitch)
Vue.use(VueMaterial.MdTable)
Vue.use(VueMaterial.MdToolbar)
Vue.use(VueMaterial.MdTooltip)

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
	{path: '/login-failed', component: LoginFailed},
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