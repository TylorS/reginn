import { join } from 'path'
import base from '../rollup.base'

const entry = join(__dirname, 'stream.js')
const dest = join(__dirname, 'dist/ragnar-stream.js')

export default Object.assign({}, base, {entry, dest})
