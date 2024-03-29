import * as express from 'express'
import * as session from 'express-session'
import connectSessionSequelize = require('connect-session-sequelize')
import * as path from 'path'
import apiRouter from './api-routers/api'
import passport from './authentication'
import {sequelize} from './models'
import {clientSecret} from '../config/oauth.json'

const SequelizeStore = connectSessionSequelize(session.Store)
const app = express()

app.use(session({
	secret: clientSecret,
	resave: false,
	saveUninitialized: false,
	store: new SequelizeStore({db: sequelize})
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(apiRouter)
app.use(express.static(path.join(__dirname, '../public')))
app.use((_, res) =>
	res.sendFile(path.join(__dirname, '../public/index.html'))
)

export default app