import { join } from 'path'
import base from '../rollup.base'

const entry = join(__dirname, 'stream.js')
const dest = join(__dirname, 'dist/reginn-stream.js')

export default Object.assign({}, base, {entry, dest})
