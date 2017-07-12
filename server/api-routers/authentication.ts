import * as express from 'express'
import passport from '../authentication'

const router = express.Router()
router.get('/', passport.authenticate('google', {
	scope: ['https://www.googleapis.com/auth/userinfo.email']
}))
router.get('/callback',
	passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: '/logged-in'
	})
)

export default router