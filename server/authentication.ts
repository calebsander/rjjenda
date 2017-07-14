import * as passport from 'passport'
import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth'
import {StudentInstance} from './models/student'
import {TeacherInstance} from './models/teacher'
import {Student, Teacher} from './models'
interface OAuthConfig {
	clientID: string
	clientSecret: string
}
const {clientID, clientSecret}: OAuthConfig = require('../config/oauth.json')

const COMMSCHOOL_DOMAIN = 'commschool.org'

type UserType = StudentInstance | TeacherInstance
passport.serializeUser<UserType, string>((user, done) => {
	done(null, user.username)
})
function lookupUsername(username: string, done: (err: Error | null, user?: UserType) => void): void {
	Student.findOne({
		attributes: ['username'],
		where: {username}
	})
		.then((student) => { //need parens around student for syntax highlighting
			if (student) done(null, student)
			else {
				Teacher.findOne({
					attributes: ['username'],
					where: {username}
				})
					.then(teacher => {
						if (teacher) done(null, teacher)
						else done(new Error('Unable to find user with username: ' + username))
					})
			}
		})
}
passport.deserializeUser<UserType, string>(lookupUsername)

passport.use(new GoogleStrategy({
	clientID,
	clientSecret,
	callbackURL: 'http://rjjenda.calebsander.com:8000/auth/callback'
}, (_, __, profile, done) => {
	if (!profile.emails) {
		done(new Error('No emails'))
		return
	}
	for (const email of profile.emails) {
		const {value} = email
		const [username, domain] = value.split('@')
		if (domain === COMMSCHOOL_DOMAIN) {
			lookupUsername(username, done)
			return
		}
	}
	done(new Error('Not a ' + COMMSCHOOL_DOMAIN + ' email address'))
}))

export default passport