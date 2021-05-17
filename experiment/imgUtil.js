let field = document.getElementById('field');
let canvas = document.getElementById('map');
let width = field.clientWidth - 15;
let height = field.clientHeight - 15 - 40;
canvas.width = width;
canvas.height = height;
console.log('宽高：', width, height);

let ctx = canvas.getContext('2d');

let redList = [];

function drawGreen(x, y, r) {
  ctx.fillStyle = '#00FF00';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function drawRed(x, y, r) {
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function randGen(num, type = 'green') {
  for (let i = 0; i < num; i ++) {
    let r = 10;
    let x = 2 * r + Math.random() * (width - 4 * r);
    let y = 2 * r + Math.random() * (height - 4 * r);
    if (type === 'green') {
      drawGreen(x, y, r);
    }
    if (type === 'red') {
      drawRed(x, y, r);
      redList.push({x, y});
    }
  }

  if (redList.length >= 2) {
    console.log(redList)
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.strokeStyle = '#FF0000';
    ctx.moveTo(redList[0].x, redList[0].y);
    ctx.lineTo(redList[1].x, redList[1].y);
    ctx.stroke();
  }
}

function drawCar(num) {
  let img = new Image();
  img.src = './car.png';
  img.onload = () => {
    if (redList.length < 2) {
      for (let i = 0; i < num; i ++) {
        let x = Math.random() * (width - 90);
        let y = Math.random() * (height - 60);
        ctx.drawImage(img, x, y, 90, 60);
      }
    } else {
      let x1 = redList[0].x, y1 = redList[0].y,
          x2 = redList[1].x, y2 = redList[1].y;
      let k = (y2 - y1) / (x2 - x1);
      let len = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      let delta = len * Math.random();
      let x = x1 + (x2 - x1) / len * delta - 45;
      let y = y1 + (y2 - y1) / len * delta - 30;
      ctx.drawImage(img, x, y, 90, 60);
    }
  }
}

function drawBaseStation(){
  let img = new Image();
  img.src = './base.png';
  img.onload = () => {
    ctx.drawImage(img, width / 2 - 40, height / 2 - 40, 80, 80);
  }
}

function clear() {
  canvas.width = width;
  redList = [];
}

// randGen(50);

document.addEventListener('DOMContentLoaded', () => {
  canvas.style.border = 'black 2px solid';
})

function dataProcess(x, y) {
  let res = [];
  for (let i = 0; i < y.length; i ++) {
    res.push([x[i], y[i]]);
  }
  return res;
}

function drawChart(domId, names, title, x, y1, y2) {
  let g = document.getElementById(domId);
  let myChart = echarts.init(g);
  let option= {
    title: {
      text: title,
      left: 100
    },
    grid: {
      left: '13%',
      right: '5%',
      top: 20,
      bottom: 25
    },
    xAxis: {
      type: 'value',
      max: 200000,
    },
    yAxis: {
      type: 'value',
      axisTick: {
        fontSize: 8
      }
    },
    series: [{
      name: names[0],
      data: dataProcess(x, y1),
      type: 'line',
    }],
    legend: {
      data: names,
    },
  };

  if (y2) {
    option.series.push({
      name: names[1],
      data: dataProcess(x, y2),
      type: 'line',
      itemStyle: {
        color: '#FF0000'
      },
      lineStyle: {
        color: '#FF0000'
      }
    })
  }

  option && myChart.setOption(option);
}
