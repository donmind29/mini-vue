//createVNode是给vue使用的，有既定的规则
//源码中还有h函数，h函数是给用户使用的，更加灵活，考虑的更多
export function createVNode(type, props, children){
  //返回虚拟DOM，是一个JS对象来描述DOM，不是真实DOM对象
  // type: 标签类型, props: 标签属性， children： 子元素
  return {type, props, children}
}