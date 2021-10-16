#!/usr/bin/env node

import {promises as fs} from 'fs'
import * as http from 'http'
import * as https from 'https'
import app from './app'
import {sequelize} from './models'
import {https as httpsSettings, port} from '../settings.json'

sequelize.sync()
	.then(() => {
		if (httpsSettings) {
			const {keyFile, certFile} = httpsSettings
			return Promise.all([fs.readFile(keyFile), fs.readFile(certFile)])
				.then(([key, cert]) =>
					Promise.resolve<http.Server>(https.createServer({key, cert}, app))
				)
		}
		else {
			return Promise.resolve(http.createServer(app))
		}
	})
	.then(server => new Promise<void>((resolve, reject) =>
		server.listen(port, resolve)
			.on('error', reject)
	))
	.then(() => console.log('Listening on port:', port))