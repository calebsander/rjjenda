import * as csvParse from 'csv-parse'
import {Readable} from 'stream'

export interface RowObject {
	[column: string]: string | undefined
}

export const parse = (csvStream: Readable, headers?: string[]): Promise<RowObject[]> =>
	new Promise<RowObject[]>((resolve, reject) => {
		const csvReader = csvParse({skip_empty_lines: true}, (err, data: string[][]) => {
			if (err) return reject(err)

			let rows: string[][]
			if (headers) rows = data
			else {
				[headers, ...rows] = data //headers contained in first row
				if (!headers) return reject(new Error('CSV file had no headers'))
			}
			const parsedRows = rows.map(row => {
				const parsedRow: RowObject = {}
				for (let column = 0; column < row.length; column++) {
					parsedRow[headers![column]] = row[column]
				}
				return parsedRow
			})
			resolve(parsedRows)
		})
		csvStream.pipe(csvReader)
	})