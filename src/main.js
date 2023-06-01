// import { createApp } from 'vue'
import { createApp } from './mini-vue/index'
import {createVNode} from './mini-vue/runtime-core/vnode'
import './style.css'
import App from './App.vue'    //App里面打印出来有render函数
const newApp = {
  data() {
    return {
      title:['one','two', 'three']
    }
  },
  render(){
    // const h3 = document.createElement('h3')
    // h3.textContent = this.title
    // return h3
    //使用我们自己写的createVNode去创建虚拟DOM
    
    if(Array.isArray(this.title)){
      return createVNode(
        'h3',
        {},
        this.title.map(t => createVNode('p', {}, t))
      )
    }else{
      return createVNode('h3', {}, this.title)
    }
  },
  mounted(){
    setTimeout(() =>{
      this.title = ['wow', 'data changed!', 'four', 'five']
    }, 2000)
  }
}
createApp(newApp).mount('#app')
