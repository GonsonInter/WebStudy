// function minSailCost( input ) {
//     let res = 1000000;
//     function recur(i, j, curCost, set) {
//         if (i === input.length - 1 && j === input[0].length - 1) {
//             if (input[i][j] === 2)  return;
//             res = Math.min(res, curCost);
//             return;
//         }
//         if (set.has(i + ',' + j) || i < 0 || j < 0 || i >= input.length || j >= input[0].length || input[i][j] === 2)    return;
//         curCost += (input[i][j] === 0 ? 2 : 1);
//         let curSet = new Set(Array.from(set));
//         curSet.add(i + ',' + j);
//         recur(i + 1, j, curCost, curSet);
//         recur(i - 1, j, curCost, curSet);
//         recur(i, j + 1, curCost, curSet);
//         recur(i, j - 1, curCost, curSet);
//     }
//
//     recur(0, 0, 0, new Set());
//     return res === 1000000 ? -1 : res;
// }
// // minSailCost([[1,1,1,1,0],[0,1,0,1,0],[1,1,2,1,1],[0,2,0,0,1]])
// console.log(minSailCost([[1,1,1,1,0,1],[0,1,0,1,0,0],[1,1,2,1,1,0],[0,2,0,0,2,1]]));

// function findKthBit( n ,  k ) {
//     let res = ['\0'];
//     res[1] = 'a';
//     for (let i = 2; i <= n; i ++) {
//         res[i] = res[i - 1] + String.fromCharCode((97 + (i - 1))) + (res[i - 1].replace(/[a-z]/g, $0 => {
//             return String.fromCharCode( 'z'.charCodeAt(0) - $0.charCodeAt(0) + 97);
//         })).split('').reverse().join('');
//     }
//     return res[n].charAt(k - 1);
// }
// console.log(findKthBit(4, 11));

let list;
list = [1,2,3,1,2,4,5,3,2,1,5];
list.push(Number.MAX_SAFE_INTEGER);
let stk = [];
let res = new Array(list.length - 1).fill(0);

list.forEach((age, index) => {
    while (stk.length && list[stk[stk.length - 1]] < age) {
        let curIndex = stk.pop();
        if (curIndex >= list.length - 1)  break;
        if (list[curIndex] === list[curIndex + 1])  res[curIndex] = 1;
        else
            res[curIndex] = Math.max(res[curIndex - 1] || 0, res[curIndex + 1] || 0) + 1;
    }
    stk.push(index);
});
console.log(res);
console.log(res.reduce((total, cur) => total + cur));