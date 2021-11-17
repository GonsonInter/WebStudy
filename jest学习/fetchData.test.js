import { fetchData } from './fetchData';

// 这样写是有问题的
// test('异步方法的测试', () => {
//   fetchData().then(res => {
//     expect(res).toEqual({
//       success: true,
//       msg: '返回了成功的数据'
//     })
//   })
// });

test('异步方法的测试', done => {
  fetchData().then(res => {
    expect(res).toEqual({
      success: true,
      msg: '返回了成功的数据'
    });
    done();
  })
});
