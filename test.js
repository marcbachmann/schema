var generate = require('./schema')

console.log(generate({
  test: 'number',
  bar: {
    foo: 'string number',
    test: 'string maxLength:10',
    blub: 'enum:[1,2]',
    c: {
      something: 'pattern:/^foobar$/'
    }
  }
}).toString())



// Features that aren't implemented yet
// {
//   $defs: {
//     User: {
//       id: 'Id'
//       name: 'string maxLength:50 required',
//     },
//     Id: 'string maxLength:36'
//   },
//   name: 'required integer max:10 min:0',
//   uuid: 'uuid',
//   foo: 'array[User]',
//   test:required: true
//   foobar: ['required int max:10'], // array item check
//   qux: {} // object check
// }

