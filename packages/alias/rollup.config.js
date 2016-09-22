import { join } from 'path'
import base from '../rollup.base'

const entry = join(__dirname, 'alias.js')
const dest = join(__dirname, 'dist/reginn-alias.js')

export default Object.assign({}, base, {entry, dest})
