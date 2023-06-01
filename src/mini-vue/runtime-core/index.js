import {reactive, effect} from '../reactivity'
import {createVNode} from './vnode'
// 运行时通用代码
//   -------------custom renderer api  --------------------
export function createRenderer(options) {
  //options里有 runtime-dom 传递过来的DOM操作相关的方法
  const {
    createElement: hostCreateElement,
    insert: hostInsert,
    setElementText:hostSetTextcontent,
    remove: hostRemove
  } = options
  //render 只负责渲染组件内容，与平台无关
  const render = (vnode, container) => {
    // 1、获取宿主元素
    // const container = options.querySelector(selector)
    //2、渲染视图
    // const observed = reactive(rootComponent.data())
    //3、为组件定义一个更新函数
    // const componentUpdateFn = () =>{
    //   const el = rootComponent.render.call(observed)
    //   options.setElementText(container, '')
    //   // 4、追加到宿主
    //   container.appendChild(el)
    // }
    // effect(componentUpdateFn)
    //初始化执行一次
    // componentUpdateFn()
    //挂载钩子是否存在
    // if(rootComponent.mounted){
    //   rootComponent.mounted.call(observed)
    // }
    //如果存在vnode则为mount流程或patch流程
    if(vnode) {
      patch(container._vnode || null, vnode, container)
    }
    container && (container._vnode = vnode)
  }
  //老节点、新节点、容器
  function patch(n1, n2, container){
    //如果n2中的type为字符串， 说明当前节点是原生element, 否则是组件
    const {type} = n2
    if(typeof type == 'string'){
      //element
      processElement(n1,n2,container)
    }else{
      //component
      processComponent(n1,n2,container)
    }
  }
  const processComponent = (n1, n2, container) =>{
    if(n1 == null){
      // mount， 说明是初始化
      mountComponent(n2, container)
    }else{
      //patch
    }
  }
  //挂载做三件事: (mountComponent中做)
    //1、组件实例化
    //2、状态初始化
    //3、副作用安装
  const mountComponent = (initialVNode, container) =>{
    //创建组件实例
    const instance = {
      data:{},
      vnode: initialVNode,
      isMounted: false
    }
    
    //初始化组件状态
      const {data: dataOptions} = instance.vnode.type
      instance.data = reactive(dataOptions())
    //安装渲染函数副作用
    setupRenderEffect(instance, container)
  }
  const setupRenderEffect = (instance, container) =>{
    //声明组件的更新函数
    const componentUpdateFn = () =>{
      //执行组件的渲染函数， 获取其vnode
        //这个render是用户传进来 用来获取当前虚拟DOM的
      const {render} = instance.vnode.type
      if(!instance.isMounted){
        //创建阶段
        //保存最新的虚拟DOM，这样下次可以作为旧的VNode与新的去比较
        const vnode = (instance.subtree = render.call(instance.data))
        //递归patch嵌套节点
        patch(null, vnode, container)

        //挂载钩子
        if(instance.vnode.type.mounted){
          instance.vnode.type.mounted.call(instance.data)
        }
        instance.isMounted = true
      }else{
        //更新阶段
        const prevVnode = instance.subtree
        //获取最新的VNode
        const nextVnode = render.call(instance.data)
        //保存下次更新使用
        instance.subtree = nextVnode
        //执行patch, 并传入新旧vnode
        patch(prevVnode, nextVnode)
      }
    }
    //建立更新机制
    effect(componentUpdateFn)
    //首次执行组件的更新函数
    componentUpdateFn()
  }

  const processElement = (n1 ,n2, container) =>{
    if(n1 === null){
      //创建阶段
      mountElement(n2,container)
    }else{
      //更新阶段
      patchElement(n1, n2)
    }
  }
  const mountElement = (vnode, container) =>{
    const el = (vnode.el = hostCreateElement(vnode.type))
    //处理节点的children前， 应该下处理下它上面的attribute    --fix
    //children如果是文本
    if(typeof vnode.children === 'string'){
      el.textContent = vnode.children
    }else{
      //children是数组，是一些子元素
      vnode.children.forEach(child => {
        //递归patch下面的子元素
        patch(null, child, el)
      })
    }
    //插入元素
    hostInsert(el, container)
  }
  const patchElement = (n1, n2) =>{
    //获取要更新的元素节点
    const el = n2.el = n1.el

    //更新type相同的节点， 实际上还要考虑key
    if(n1.type === n2.type){
      //获取双方子元素
      const oldCh = n1.children
      const newCh = n2.children

      //根据双方子元素情况做不同处理‘
      if(typeof oldCh === 'string'){
        if(typeof newCh === 'string'){
          //说明就是文本内容的变更
          if(oldCh != newCh){
            hostSetTextcontent(el, newCh)
          }
        }else{
          //说明文本变成了子元素
          hostSetTextcontent(el, '')
          //创建一组新元素
          newCh.forEach(child => {
            patch(null, child, el)
          })
        }
      }else{
        if(typeof newCh === 'string'){
          //之前是子元素数组，现在变成字符串了
          hostSetTextcontent(el, newCh)
        }else{
          //变化前后都是子元素数组
          updateChildren(oldCh, newCh, el)
        }
      }
    }
  }
  const updateChildren = (oldCh, newCh, parentElm) =>{
    //不考虑key， 也不考虑节点相同的情况，直接上去更新
    const len = Math.min(oldCh.length, newCh.length)
    for(let i = 0; i < len; i++){
      patch(oldCh[i], newCh[i])
    }
    //获取较长数组中剩余的部分
    if(newCh.length > oldCh.length){
      //新数组有多的元素，批量 创建
      newCh.slice(len).forEach(child => patch(null, child, parentElm))
    }else{
      //老数组较长，剩下的批量删除
      oldCh.slice(len).forEach(child => hostRemove(child.el))
    }
  }
  //返回一个渲染器实例
  return {
    render,
    //提供给用户一个createApp方法
    createApp: createAppAPI(render)
  }
}

export function createAppAPI(render){
  //返回的createApp就是 main.js里调用的createApp
  return function createApp(rootComponent){
    //app里不止有mount一个方法，  .use啊什么的都在这里拓展
    const app = {
      mount(container){
        //将根组件的配置转换成虚拟DOM
        const vnode = createVNode(rootComponent)
        //传入根组件vnode， 此时render的作用是将虚拟DOM转换成真实DOM，并追加到宿主
        render(vnode, container)
      }
    }
    return app
  }
}