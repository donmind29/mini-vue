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
  }
}

//确保renderer单例
function ensureRenderer(){
  return renderer || (renderer = createRenderer(rendererOptions))
}

//创建APP实例
export function createApp(rootComponent){
  //接收根组件， 返回App实例
  return ensureRenderer().createApp(rootComponent)
}