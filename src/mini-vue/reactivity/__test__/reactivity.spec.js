import {reactive} from '../index.js'

test('reactive should work', () =>{
  const original = {foo: 'foo'}
  const observed = reactive(original)

  //代理对象是全新的对象
  expect(observed).not.toBe(original)
  //期望能访问到代理对象的属性
  expect(observed.foo).toBe('foo')
  //修改代理对象的属性
  observed.foo = 'newFoooo'
  expect(original.foo).toBe('newFoooo')
  //新增代理对象的属性
  observed.bar = 'bar'
  expect(original.bar).toBe('bar')
  //删除代理对象的属性
  delete observed.foo
  expect(original.foo).toBe(undefined)
})