import { join } from 'path'
import base from '../rollup.base'

const entry = join(__dirname, 'callback.js')
const dest = join(__dirname, 'dist/reginn-callback.js')

export default Object.assign({}, base, {entry, dest})
