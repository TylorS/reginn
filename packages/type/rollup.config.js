import { join } from 'path'
import base from '../rollup.base'

const entry = join(__dirname, 'type.js')
const dest = join(__dirname, 'dist/reginn-type.js')

export default Object.assign({}, base, {entry, dest})
