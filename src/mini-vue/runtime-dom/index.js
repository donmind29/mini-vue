import {createRenderer} from '../runtime-core'
//这里写浏览器平台一些特有的操作
let renderer;

//dom平台特有的节点操作
const rendererOptions = {
  //封装DOM操作等 浏览器平台特有的行为
  querySelector(selector){
    return document.querySelector(selector)
  },
  insert(child, parent, anchor){
    //anchor是锚点
    parent.insertBefore(child, anchor || null)
  },
  setElementText(el, text){
    el.textContent = text
  },
  createElement(tag){
    return document.createElement(tag)
  },
  remove(el){
    const parent = el.parentNode
    parent && parent.removeChild(el)
  }
}

//确保renderer单例
function ensureRenderer(){
  return renderer || (renderer = createRenderer(rendererOptions))
}

//创建APP实例
export function createApp(rootComponent){
  //接收根组件， 返回App实例
  const app =  ensureRenderer().createApp(rootComponent)
  //保存app.mount方法
  const mount = app.mount
  //重写app.mount方法， 包装一下以便去获取选择器
  app.mount = function (selectorOrContainer){
    //传入的是DOM元素，直接返回； 传入的是字符串，转换成DOM元素
    const container = typeof selectorOrContainer == 'string' ?
                      document.querySelector(selectorOrContainer) :
                      selectorOrContainer
    mount(container)
  }
  return app
}