import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as session from 'express-session'
import connectSessionSequelize = require('connect-session-sequelize')
import apiRouter from './api-routers/api'
import passport from './authentication'
import {sequelize} from './models'

const SequelizeStore = connectSessionSequelize(session.Store)
const app = express()

app.use(bodyParser.json())
app.use(session({
	secret: require('../config/oauth.json').clientSecret,
	resave: false,
	saveUninitialized: false,
	store: new SequelizeStore({db: sequelize})
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static('public'))
app.use(apiRouter)

export default app