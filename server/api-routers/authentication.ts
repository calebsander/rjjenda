import * as express from 'express'
import passport, {UserType} from '../authentication'

const router = express.Router()
router.get('/', passport.authenticate('google', {
	scope: ['https://www.googleapis.com/auth/userinfo.email']
}))
router.get('/callback', (req, res, next) => {
	passport.authenticate('google', (err: Error | null, user: UserType | null) => {
		if (err) return next(err)
		if (user) {
			req.logIn(user, err => {
				if (err) return next(err)
				res.redirect('/')
			})
		}
		else res.redirect('/login-failed')
	})(req, res, next)
})

export default router