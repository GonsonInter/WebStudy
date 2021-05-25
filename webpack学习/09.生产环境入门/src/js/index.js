import 'core-js/modules/es.object.to-string.js';
import 'core-js/modules/es.promise.js';
import 'core-js/modules/web.timers.js';

import 'core-js/modules/es6.object.to-string.js';
import 'core-js/modules/es6.promise.js';
import '../css/a.css';
import '../css/b.css';

const add = function add(x, y) {
  return x + y;
}; // 下一行不进行eslint检查，即eslint规则全部失效
// eslint-disable-next-line

const p = new Promise((resolve) => {
  setTimeout(() => {
    console.log(123);
    resolve();
  });
});
console.log(add(2, 5));
console.log(p);
