var bench = require('nanobench')
var schema = require('./schema')

bench('objHas-false")', function (b) {
  var scheme = schema('object has:test has:bench !has:nope')
  // var obj = {test: 1, bench: 2}
  var obj = {test: 1, bench: 2, nope: 3}
  b.start()

  for (var i = 0; i < 10e7; i++) {
    scheme(obj)
  }

  b.end()
})

bench('objTest', function (b) {
  var scheme = schema('object !null !array')
  var obj = {}
  b.start()

  for (var i = 0; i < 10e7; i++) {
    scheme(obj)
  }

  b.end()
})

