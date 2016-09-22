import { join } from 'path'
import base from '../rollup.base'

const entry = join(__dirname, 'run.js')
const dest = join(__dirname, 'dist/reginn-run.js')

export default Object.assign({}, base, {entry, dest})
