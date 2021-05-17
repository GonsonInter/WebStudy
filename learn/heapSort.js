function GetLeastNumbers_Solution(input, k) {
  // write code here
  function adjustHeap(arr, index, length) {
    while (index < Math.floor(length / 2)) {
      let lchild = index * 2 + 1;
      let rchild = null;
      if (index * 2 + 2 < length) {
        rchild = index * 2 + 2;
      }
      let maxIndex = index;
      maxIndex = arr[maxIndex] >= arr[lchild] ? maxIndex : lchild;
      if (rchild) {
        maxIndex = arr[maxIndex] >= arr[rchild] ? maxIndex : rchild;
      }
      if (maxIndex !== index) {
        [arr[maxIndex], arr[index]] = [arr[index], arr[maxIndex]];
        adjustHeap(arr, maxIndex, length);
      } else  return;
    }
  }

  function buildHeap(arr) {
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i --) {
      adjustHeap(arr, i, arr.length);
    }
  }

  buildHeap(input);
  for (let i = input.length - 1; i >= 0; i--) {
    [input[0], input[i]] = [input[i], input[0]];
    adjustHeap(input, 0, i);
  }
  return input;
}

console.log(GetLeastNumbers_Solution([5, 9, 6, 8, 7, 3, 5, 4]))
