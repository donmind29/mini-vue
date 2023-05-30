// 运行时通用代码
//   -------------custom renderer api  --------------------
export function createRenderer(options) {
  //render 只负责渲染组件内容，与平台无关
  const render = (rootComponent, selector) => {
    // 1、获取宿主元素
    const container = options.querySelector(selector)
    //2、渲染视图
    const el = rootComponent.render.call(rootComponent.data())
    // 3、追加到宿主
    container.appendChild(el)
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