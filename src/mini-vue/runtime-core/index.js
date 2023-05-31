import {reactive, effect} from '../reactivity'
// 运行时通用代码
//   -------------custom renderer api  --------------------
export function createRenderer(options) {
  //render 只负责渲染组件内容，与平台无关
  const render = (rootComponent, selector) => {
    // 1、获取宿主元素
    const container = options.querySelector(selector)
    //2、渲染视图
    const observed = reactive(rootComponent.data())
    //3、为组件定义一个更新函数
    const componentUpdateFn = () =>{
      const el = rootComponent.render.call(observed)
      options.setElementText(container, '')
      // 4、追加到宿主
      container.appendChild(el)
    }
    effect(componentUpdateFn)
    //初始化执行一次
    componentUpdateFn()
    //挂载钩子是否存在
    if(rootComponent.mounted){
      rootComponent.mounted.call(observed)
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
      mount(selector){
        render(rootComponent, selector)
      }
    }
    return app
  }
}