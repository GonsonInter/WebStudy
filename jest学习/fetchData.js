export function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject();
      resolve({
        success: true,
        msg: '返回了成功的数据'
      })
    }, 1000);
  })
}
