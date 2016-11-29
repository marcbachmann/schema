module.exports = generate

function t (s, ty) {
  return function (a) {
    if (ty === 'number' && typeof a === 'undefined') throw new Error('You have to pass a number.')
    if (ty === 'regex' && !(/^\/.*\/$/.test(a))) throw new Error('You have to pass a regex.')
    return s.replace('$0', a)
  }
}

var validators = {
  null: t('v === null'),
  string: t('typeof v === "string"'),
  number: t('typeof v === "number"'),
  integer: t('Math.floor(v) === v'),
  boolean: t('typeof v === "boolean"'),
  function: t('typeof v === "function"'),
  object: t('typeof v === "object"'),
  array: t('Array.isArray(v)'),
  regexp: t('v instanceof RegExp'),
  min: t('v >= $0', 'number'),
  max: t('v <= $0', 'number'),
  minLength: t('v.length >= $0', 'number'),
  maxLength: t('v.length <= $0', 'number'),
  required: t('typeof v != "undefined"'),
  pattern: t('$0.test(v)', 'regex'),
  date: t('Date.parse(v) > 0'), // value instanceof Date
  falsy: t('!$0'),
  truthy: t('!!$0'),
  has: t('typeof v["$0"] !== \'undefined\''),
  enum: function (str) {
    arr = JSON.parse(str)
    if (!Array.isArray(arr)) throw new Error('You have to pass an array.')
    return '!!~' + JSON.stringify(arr) + '.indexOf(v)'
  }
}

function generate (schema) {
  var arr = toSchema([], schema)
  arr.push('return true')
  return new Function([
    'return function validate (o) {',
    'var v',
    arr.join(';\n  ') + '\n}',
  ].join('\n  '))()
}

function toSchema (arr, prop, keys) {
  if (!prop) throw new Error('You have to pass a schema.')
  if (typeof prop === 'string') return arr.push(createCheck(prop, keys)) && arr // exact match
  if (Array.isArray(prop)) return toArray(arr, prop) // one of elements
  if (typeof prop === 'object') return toObject(arr, prop, keys) // each prop
}

function toArray (arr, prop) {
  prop.forEach(function (val, i) { toSchema(arr, val, i) })
  return arr
}

function toObject (arr, prop, keys) {
  if (keys) arr.push('if (v = o' + enclose(keys) + ', typeof v !== \'object\') return false')
  Object.keys(prop).map(function (key) {
    toSchema(arr, prop[key], keys ? keys.concat(key) : [key])
  })
  return arr
}

function enclose (arr) {
  return arr.map(function (key) { return '[' + JSON.stringify(key) + ']' }).join('')
}

var booleanExpression = require('boolean-expression')
function createCheck (defs, keys) {
  var val
  if (typeof keys !== 'undefined') val = 'v = o' + enclose(keys)
  else val = 'v = o'

  if (!/(&&|\|\||AND|OR)/.test(defs)) defs = defs.split(' ').join(' && ')
  var expression = booleanExpression(defs)
  var str = expression(function (def) {
    var v = def.split(':')
    var args = v.slice(1)
    var validator = validators[v[0]]
    if (!validator) throw new Error('The validator "' + v[0] + '" does not exist.')
    else return '(' + validator.apply(null, args) + ')'
  })
  return 'if (' + val + ', !(' + str + ')) return false'
}
