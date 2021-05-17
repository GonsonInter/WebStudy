function sort(nums) {
  // // 快速排序
// function quickSort(nums, low, high) {
//     if (low >= high)    return;
//     let pivot = low;
//     let l = low, h = high;
//     while (l < h) {
//         while (l < h && nums[pivot] <= nums[h])  h --;
//         while (l < h && nums[pivot] >= nums[l])  l ++;
//         [nums[h], nums[l]] = [nums[l], nums[h]];
//     }
//     [nums[pivot], nums[l]] = [nums[l], nums[pivot]];
//     quickSort(nums, low, l - 1);
//     quickSort(nums, l + 1, high);
// }

// quickSort(nums, 0, nums.length - 1);
// return nums;


// // 冒泡排序
// function babSort(nums) {
//     for (let i = 0 ; i < nums.length; i ++) {
//         for (j = nums.length - 1; j > i; j --) {
//             if (nums[j - 1] > nums[j]) {
//                 [nums[j - 1], nums[j]] = [nums[j], nums[j - 1]];
//             }
//         }
//     }
// }
// babSort(nums);


// // 选择排序
// function selectSort(nums) {
//   for (let i = 0; i < nums.length; i ++) {
//     let minIndex = i;
//     let min = Number.MAX_VALUE;
//     for (let j = i; j < nums.length; j ++) {
//       if (nums[j] < min) {
//         minIndex = j;
//         min = nums[j];
//       }
//     }
//     [nums[i], nums[minIndex]] = [nums[minIndex], nums[i]];
//   }
// }


  // // 堆排序
  // function adjustHeap(nums, index, length) {
  //   if (index > Math.floor(length / 2) - 1)  return;
  //   let lChild = index * 2 + 1;
  //   let rChild = null;
  //   if (index * 2 + 2 < length) {
  //     rChild = index * 2 + 2;
  //   }
  //   let max = index;
  //   if (nums[max] < nums[lChild]) {
  //     max = lChild;
  //   }
  //   if (rChild && nums[max] < nums[rChild]) {
  //     max = rChild;
  //   }
  //   if (max !== index) {
  //     [nums[max], nums[index]] = [nums[index], nums[max]];
  //     adjustHeap(nums, max, length);
  //   }
  // }
  //
  // function heapSort(nums) {
  //   for (let i = Math.floor(nums.length / 2) - 1; i >= 0; i --) {
  //     adjustHeap(nums, i, nums.length);
  //   }
  //   for (let i = nums.length - 1; i > 0; i --) {
  //     [nums[0], nums[i]] = [nums[i], nums[0]];
  //     adjustHeap(nums, 0, i);
  //   }
  //   return nums;
  // }
  //
  // heapSort(nums);


  // // 归并排序
  // function mergeSort(nums) {
  //   if (nums.length < 2) {
  //     return nums;
  //   }
  //   let middle = Math.floor(nums.length / 2),
  //       left = nums.slice(0, middle),
  //       right = nums.slice(middle);
  //   return merge(mergeSort(left), mergeSort(right));
  // }
  //
  // function merge(left, right) {
  //   let result = [];
  //   while (left.length && right.length) {
  //     if (left[0] <= right[0]) {
  //       result.push(left.shift());
  //     } else {
  //       result.push(right.shift());
  //     }
  //   }
  //   while (left.length) {
  //     result.push(left.shift());
  //   }
  //   while (right.length) {
  //     result.push(right.shift());
  //   }
  //   return result;
  // }
  //
  // return mergeSort(nums);


  // 基数排序


}

let nums = [5, 6, 8, 2, 10, 53, 984, 62, 123, 3, 78, 98, 96, 56, 29, 89, 65, 30];
let res = sort(nums);
console.log(res);
