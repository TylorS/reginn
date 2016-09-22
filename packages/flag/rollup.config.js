import { join } from 'path'
import base from '../rollup.base'

const entry = join(__dirname, 'flag.js')
const dest = join(__dirname, 'dist/reginn-flag.js')

export default Object.assign({}, base, {entry, dest})
