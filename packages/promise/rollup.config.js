import { join } from 'path'
import base from '../rollup.base'

const entry = join(__dirname, 'promise.js')
const dest = join(__dirname, 'dist/reginn-promise.js')

export default Object.assign({}, base, {entry, dest})
