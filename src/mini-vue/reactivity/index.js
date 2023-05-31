//当前的活动副作用
let activeEffect

//外界传进来函数给activeEffect赋值
export function effect(fn) {
  activeEffect = fn
}
//接收需要做响应式处理的对象
//track 做依赖收集
//trigger去派发更新
export function reactive(obj){
  return new Proxy(obj, {
    get(target,key){   //get
      // return target[key]    直接返回target[key]我们不知道结果如何，使用reflect能获取到结果
      const value =  Reflect.get(target, key)
      track(target, key)
      return value
    },
    set(target,key, value) {   //set
      const result =  Reflect.set(target, key , value)
      trigger(target, key)
      return result
    },
    deleteProperty(target, key){   //删除操作
      const result =  Reflect.deleteProperty(target, key)
      trigger(target, key)
      return result
    }
  })
}

//创建一个map去保存依赖关系 {target: {key: [fn1, fn2]}}
//weakmap是弱引用，键是对象的话有利于释放垃圾
const targetMap = new WeakMap()
function track(target, key){
  if(activeEffect) {
    let depsMap = targetMap.get(target)
    //针对target第一次进来， depsMap是不存在的，需要创建
    if(!depsMap){ 
      // depsMap = new Map() 结果会往出传递，可以自做到同时设置depsMap和进行xxx.set(yyy, zzz)的操作
      targetMap.set(target, (depsMap = new Map()))
    }
    //获取depsMap中key对应的set, set里面放的是key对应的更新函数，要保证唯一，避免放入相同的函数多次执行
    let deps = depsMap.get(key)
    //首次
    if(!deps) {
      depsMap.set(key, (deps = new Set()))
    }
    //添加当前激活的副作用函数
    deps.add(activeEffect)
  }
}

function trigger(target, key){
  const depsMap = targetMap.get(target)
  if(depsMap){
    const deps = depsMap.get(key)
    if(deps){
      deps.forEach(dep => dep())
    }
  }
}