import * as passport from 'passport'
import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth'
interface OAuthConfig {
	clientID: string
	clientSecret: string
}
const {clientID, clientSecret}: OAuthConfig = require('../config/oauth.json')

passport.use(new GoogleStrategy({
	clientID,
	clientSecret,
	callbackURL: 'https://goo.gl/mCExex'
}, (accessToken, refreshToken, profile, done) => {
	console.log(accessToken, refreshToken, profile, profile.id)
	done(null, null)
}))

export default passport