// 判断两个数组是否相等
function arrayEquals(array1, array2) {
  let arr1 = array1.slice(0), arr2 = array2.slice(0);
  if (arr1.length !== arr2.length) return false;
  // arr1.sort(); arr2.sort();
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] instanceof Array && arr2[i] instanceof Array)
      return arrayEquals(arr1[i], arr2[i]);
    else if (!(arr1[i] instanceof Array) && !(arr2[i] instanceof Array)) {
      if (arr1[i] !== arr2[i]) return false;
    } else return false;
  }
  return true;
}
function diff(arr1, arr2) {
  let arrPlain1 = [], arrRec1 = [];
  let arrPlain2 = [], arrRec2 = [];
  arr1.forEach(item => {
    if (!(item instanceof Array)) arrPlain1.push(item);
    else arrRec1.push(item);
  })
  arr2.forEach(item => {
    if (!(item instanceof Array)) arrPlain2.push(item);
    else arrRec2.push(item);
  })

  return [].concat(arrPlain1.concat(arrPlain2).
  filter((value, index, self) => {
    return self.indexOf(value) === self.lastIndexOf(value);
  }))
      .concat(arrRec1.filter(item => {
        return !arrRec2.some(ar => {
          return arrayEquals(item, ar);
        })
      }))
      .concat(arrRec2.filter(item => {
        return !arrRec1.some(ar => {
          return arrayEquals(item, ar);
        })
      }))
}


let arr1 = [[1, 2, 3], [3, 2, [1, 2], 1], 1, 2, 3, 4];
let arr2 = [2, 3, 1, [3, 2, [2, 1], 1]];
console.log(diff(arr1, arr2));
