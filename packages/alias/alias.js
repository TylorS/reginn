export const alias = (name, aliasedName) =>
  ({ type: TYPE, value: [replaceDash(name), replaceDash(aliasedName || name)] })

const TYPE = 'alias'
const replaceDash = str => str.replace(/-+/, '')
