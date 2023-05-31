// import { createApp } from 'vue'
import { createApp } from './mini-vue/index'
import './style.css'
import App from './App.vue'    //App里面打印出来有render函数
const newApp = {
  data() {
    return {
      title:'Hello mini-vue3'
    }
  },
  render(){
    // const h3 = document.createElement('h3')
    // h3.textContent = this.title
    // return h3
    //使用我们自己写的createVNode去创建虚拟DOM
    return createVNode('h3', {}, this.title)
  },
  mounted(){
    setTimeout(() =>{
      this.title = 'wow, data changed!'
    }, 2000)
  }
}
createApp(newApp).mount('#app')
