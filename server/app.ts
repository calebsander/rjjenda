import * as express from 'express'

const app = express()

app.use(express.static('public'))

export default app