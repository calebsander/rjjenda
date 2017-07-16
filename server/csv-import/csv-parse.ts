import * as csvParse from 'csv-parse'
import {Readable} from 'stream'

export interface RowObject {
	[column: string]: string | undefined
}

export const parse = (csvStream: Readable): Promise<RowObject[]> =>
	new Promise<RowObject[]>((resolve, reject) => {
		const csvReader = csvParse({skip_empty_lines: true}, (err, data: string[][]) => {
			if (err) {
				reject(err)
				return
			}
			const [headers, ...rows] = data
			const parsedRows = rows.map(row => {
				const parsedRow: RowObject = {}
				for (let column = 0; column < row.length; column++) {
					parsedRow[headers[column]] = row[column]
				}
				return parsedRow
			})
			resolve(parsedRows)
		})
		csvStream.pipe(csvReader)
	})