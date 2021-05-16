function getMin(arr) {
  arr.sort((o1, o2) => o1 - o2);
  console.log((arr));
  let i = 0;
  while (i <= arr.length - 1) {
    if (i === arr.length - 1 || arr[i] !== arr[i + 1]) {
      return arr[i];
    }    else {
      let j = i + 1;
      while (j < arr.length && arr[j] === arr[i])    j ++;
      console.log(i + '  ' + j);
      i = j;
    }
  }
  return -1;
}

let n = readLine();
let arr = readLine().split(' ').map(item => parseInt(item));
console.log('12311123'.split(''));



// 第二题
let line = readline().split(' ').map(item => parseInt(item));
let rows = line[0], cols = line[1];
let grid = [];
let visited = [];
for (let i = 0; i < rows; i ++) {
  grid[i] = readline().split('');
}

console.log(numsCountry());


function numsCountry() {
  let count = 0;
  visited = new Array(rows).fill(0).map(item => new Array(cols).fill(false));

  for (let i = 0; i < rows; i ++) {
    for (let j = 0; j < cols; j ++) {
      let t = grid[i][j];
      if (!visited[i][j]) {
        count ++;
        dfs(i, j, t);
      }
    }
  }

  return count;
}

function dfs(x, y, s) {
  if (!isArea(x, y) || visited[x][y] || grid[x][y] !== s) {
    return;
  }
  visited[x][y] = true;
  dfs(x - 1, y, s);
  dfs(x + 1, y, s);
  dfs(x, y - 1, s);
  dfs(x, y + 1, s);
}

function isArea(x, y) {
  return x >= 0 && y >= 0 && x < rows && y < cols;
}
