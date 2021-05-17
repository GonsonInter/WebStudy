// 定义一个动物类
function Animal (name) {
  // 属性
  this.name = name || 'Animal';
  // 实例方法
  this.sleep = function(){
    console.log(this.name + '正在睡觉！');
  }
}
// 原型方法
Animal.prototype.eat = function(food) {
  console.log(this.name + '正在吃：' + food);
};


// // 原型链继承
// function Cat() {}
// Cat.prototype = new Animal();
// Cat.prototype.name = 'cat';

// // 构造继承
// function Cat(name) {
//   Animal.call(this);
//   this.age = 12;
// }

// // 组合继承
// function Cat() {
//   Animal.call(this);
// }
// Cat.prototype = new Animal();

// // 实例继承
// function Cat() {
//   let instance = new Animal();
//   instance.name = 'aaa';
//   return instance;
// }

// // 拷贝继承
// function Cat() {
//   let animal = new Animal();
//   for (let item in animal) {
//     Cat.prototype[item] = animal[item];
//   }
// }

// // 寄生组合继承
// function Cat() {
//   Animal.call(this);
// }
// (function () {
//   let Super = function () {}
//   Super.prototype = Animal.prototype;
//   Cat.prototype = new Super();
// })()
