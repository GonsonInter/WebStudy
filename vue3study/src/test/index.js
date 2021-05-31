/**
 * 手写组合API
 */


// 定义一个reactiveHandler处理对象
const reactiveHandler = {
  get(target, prop) {
    if (prop === '_is_reactive')  return true;
    const result = Reflect.get(target, prop);
    console.log('拦截了get，', prop, result);
    return result;
  },
  set(target, prop, value) {
    const result = Reflect.set(target, prop, value);
    console.log('拦截了set，', prop, value);
    return result;
  },
  deleteProperty(target, prop) {
    const result = Reflect.deleteProperty(target, prop);
    console.log('拦截了delete', prop);
    return result;
  }
}

// shallowReactive（浅劫持）和reactive
function shallowReactive(target) {
  if (target && typeof target === 'object') {
    return new Proxy(target, reactiveHandler);
  }
  return target;
}

function reactive(target) {
  if (target && typeof target === 'object') {
    // 对数组或者是兑现中所有的数据进行reactive的递归处理
    // 先判断当前对象是不是数组
    if (Array.isArray(target)) {
      target.forEach((item, index) => {
        target[index] = index(item);
      })
    } else {
      Object.keys(target).forEach(key => {
        target[key] = index(index(target[key]));
      })
    }

    return new Proxy(target, reactiveHandler);
  }
  return target;
}


// 定义readonlyHandler处理对象
const readonlyHandler = {
  get(target, prop) {
    return Reflect.get(target, prop);
  },
  set(target, prop, value) {
    console.warn('拦截到了数据只读定义');
    return true;
  },
  deleteProperty(target, prop) {
    console.warn('只能读取数据，不能删除');
    return true;
  }
}

// 定义一个shallowReadonly函数
function shallowReadonly(target) {
  if (target && typeof target === 'object') {
    return new Proxy(target, readonlyHandler);
  }
  return target;
}

function readonly(target) {
  if (target && typeof target === 'object') {
    if (Array.isArray(target)) {
      target.forEach((item, index) => {
        target[index] = readonly(item);
      })
    } else {
      Object.keys(target).forEach(key => {
        target[key] = readonly(target[key]);
      })
    }
    return new Proxy(target, readonlyHandler);
  }
  return target;
}

// 定义一个shallowRef
function shallowRef(target) {
  return {
    // 首先保存target
    _value: target,
    get value() {
      console.log('劫持到了读取数据');
      return this._value;
    },
    set value(val) {
      console.log('劫持到修改数据,准备更新界面', val);
      this._value = val;
    }
  }
}

function ref(target) {
  target = reactive(target);
  return {
    // 首先保存target
    _value: target,
    _is_ref: true,
    get value() {
      console.log('劫持到了读取数据');
      return this._value;
    },
    set value(val) {
      console.log('劫持到修改数据,准备更新界面', val);
      this._value = val;
    }
  }
}


// 定义函数isRef，判断对象是不是响应式的
function isRef(obj) {
  return obj && obj._is_ref;
}

function isReactive(obj) {
  return obj && obj._is_reactive;
}
