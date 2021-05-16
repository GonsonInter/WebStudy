function maxLength( arr ) {
  // write code here
  let maxSub = 0;
  let sliceArr = [];
  for (let i = 0; i < arr.length; i ++) {
    let existIndex = sliceArr.indexOf(arr[i]);
    if (existIndex > -1) {
      sliceArr = sliceArr.slice(existIndex + 1);
      sliceArr.push(arr[i]);
    }  else {
      sliceArr.push(arr[i]);
    }
    maxSub = Math.max(maxSub, sliceArr.length);
  }
  return maxSub;
}

console.log(maxLength([2,3,4,5, 5, 8, 10, 2, 7, 6, 23, 78, 30, 15, 6, 5, 4, 2, 5]))
