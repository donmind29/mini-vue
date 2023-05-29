//创建应用实例
export const createApp = (rootComponent) =>{
  //rootComponent是用户传进来的组件
  console.log(rootComponent)
  return {
    mount(selector){
      // 1、获取宿主元素
      const container = document.querySelector(selector)
      //2、渲染视图
      const el = rootComponent.render.call(rootComponent.data())
      // 3、追加到宿主
      container.appendChild(el)
    }
  }
}