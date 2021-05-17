// class myPromise {
//
//   constructor(executor) {
//     // 参数校检
//     if (typeof executor !== 'function') {
//       throw new TypeError(`Promise resolver ${executor} is not a function.`)
//     }
//     // 初始化
//     this.initValue();
//     try {
//       executor(this.resolve, this.reject);
//     } catch (e) {
//       this.reject(e);
//     }
//
//   }
//
//   initValue() {
//     this.value = null;
//     this.reason = null;
//     this.state = myPromise.PENDING;
//     this.onFulfilledCallbacks = [];   // 成功的回调
//     this.onRejectedCallbacks = [];    // 失败的回调
//   }
//
//   initBind() {
//     this.resolve = this.resolve.bind(this);
//     this.reject = this.reject.bind(this);
//   }
//
//   resolve = value => {
//     // 成功后的一系列操作（状态的改变，成功回调的执行）
//     if (this.state === myPromise.PENDING) {
//       this.state = myPromise.FULFILLED;
//       this.value = value;
//       this.onFulfilledCallbacks.forEach(fn => fn(this.value));
//     }
//   }
//
//   reject = reason => {
//     // 失败后的一系列操作（状态的改变，失败回调的执行）
//     if (this.state === myPromise.PENDING) {
//       this.state = myPromise.REJECTED;
//       this.reason = reason;
//       this.onRejectedCallbacks.forEach(fn => fn(this.reason));
//     }
//   }
//
//   then(onFulfilled, onRejected) {
//     // 参数校检
//     if (typeof onFulfilled !== 'function') {
//       onFulfilled = function (value) {
//         return value;
//       }
//     }
//
//     if (typeof onRejected !== 'function') {
//       onRejected = function (reason) {
//         throw reason;
//       }
//     }
//
//     if (this.state === myPromise.FULFILLED) {
//       setTimeout(() => {
//         onFulfilled(this.value);
//       })
//
//     }
//
//     if (this.state === myPromise.REJECTED) {
//       setTimeout(() => {
//         onRejected(this.reason);
//       })
//     }
//
//     if (this.state === myPromise.PENDING) {
//       this.onFulfilledCallbacks.push(value => {
//         setTimeout(() => {
//           onFulfilled( value);
//         })
//       })
//
//       this.onFulfilledCallbacks.push(reason => {
//         setTimeout(() => {
//           onRejected(reason);
//         })
//       })
//     }
//
//   }
//
// }
//
// myPromise.PENDING = 'pending';
// myPromise.FULFILLED = 'fulfilled';
// myPromise.REJECTED = 'rejected';
//
// console.log(1);
// new myPromise((resolve, reject) => {
//   console.log(2);
//   resolve(1);
// }).then(value => {
//   console.log(3);
//   // console.log(value);
// })
// console.log(4);


class MyPromise {

  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError(`Promise resolver ${executor} is not a function.`);
    }

    this.initValue();
    this.initBind();

    try {
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  initValue() {
    this.value = null;
    this.reason = null;
    this.state = MyPromise.PENDING;
    this.onFulfilledCallbacks = [];   // 成功的回调队列
    this.onRejectedCallbacks = [];    // 失败的回调队列
  }

  initBind() {
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
  }

  resolve = function (value) {
    if (this.state === MyPromise.PENDING) {
      this.state = MyPromise.FULFILLED;
      this.value = value;
      this.onFulfilledCallbacks.forEach(fn => fn(this.value));
    }
  }

  reject = function (reason) {
    if (this.state === MyPromise.PENDING) {
      this.state = MyPromise.REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach(fn => fn(this.reason));
    }
  }

  then(onFulfilled, onRejected) {
    // 参数校检
    if (typeof onFulfilled !== 'function') {
      onFulfilled = function (value) {
        return value;
      }
    }
    if (typeof onFulfilled !== 'function') {
      onRejected = function (reason) {
        throw reason;
      }
    }

    // 实现链式调用，且改变了后面then的值，必须通过新的实例来完成
    return new MyPromise((resolve, reject) => {
      if (this.state === MyPromise.FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolve(x);
          } catch (e) {
            reject(e);
          }
        });
      }
      if (this.state === MyPromise.REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolve(x);
          } catch (e) {
            reject(e);
          }
        });
      }
      if (this.state === MyPromise.PENDING) {
        this.onFulfilledCallbacks.push(value => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolve(x);
            } catch (e) {
              reject(e);
            }
          })
        });
        this.onRejectedCallbacks.push(reason => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolve(x);
            } catch (e) {
              reject(e);
            }
          })
        })
      }
    })
  }

}

MyPromise.PENDING = 'pending';
MyPromise.FULFILLED = 'fulfilled';
MyPromise.REJECTED = 'rejected';
MyPromise.resolvePromise = function (promise2, x, resolve, reject) {
  // 判断x是否和promise相等
  if (promise2 === x) {
    reject(new TypeError('Chaining cycle detected for promise'));
  }

  let isCalled = false;
  if (x instanceof MyPromise) {
    x.then(value => {
      resolve(value);
    }, reason => {
      reject(reason);
    })
  } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // x为对象或者函数
    try {
      const then = x.then;
      if (typeof x.then === 'function') {
        then.call(x, value => {
          if (isCalled) return;
          isCalled = true;
          MyPromise.resolvePromise(promise2, x, resolve, reject);
        })
      } else {
        if (isCalled) return;
        isCalled = true;
        resolve(x);
      }
    } catch (e) {
      if (isCalled) return;
      isCalled = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}


let p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    console.log(2);
    resolve(1);
  })
}).then(value => {
  console.log(4);
}, reason => {
  console.log(5);
}).then(value => {
  throw new Error('cuole')
})

