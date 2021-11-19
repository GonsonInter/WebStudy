import * as echarts from 'echarts';

var app = {};

// var chartDom = document.getElementById('main');
// var myChart = echarts.init(chartDom);
var option;

const posList = [
  'left',
  'right',
  'top',
  'bottom',
  'inside',
  'insideTop',
  'insideLeft',
  'insideRight',
  'insideBottom',
  'insideTopLeft',
  'insideTopRight',
  'insideBottomLeft',
  'insideBottomRight'
];
app.configParameters = {
  rotate: {
    min: -90,
    max: 90
  },
  align: {
    options: {
      left: 'left',
      center: 'center',
      right: 'right'
    }
  },
  verticalAlign: {
    options: {
      top: 'top',
      middle: 'middle',
      bottom: 'bottom'
    }
  },
  position: {
    options: posList.reduce(function (map, pos) {
      map[pos] = pos;
      return map;
    }, {})
  },
  distance: {
    min: 0,
    max: 100
  }
};
app.config = {
  rotate: 90,
  align: 'left',
  verticalAlign: 'middle',
  position: 'insideBottom',
  distance: 15,
  onChange: function () {
    const labelOption = {
      rotate: app.config.rotate,
      align: app.config.align,
      verticalAlign: app.config.verticalAlign,
      position: app.config.position,
      distance: app.config.distance
    };
    myChart.setOption({
      series: [
        {
          label: labelOption
        },
        {
          label: labelOption
        },
        {
          label: labelOption
        },
        {
          label: labelOption
        }
      ]
    });
  }
};
const labelOption = {
  show: true,
  position: app.config.position,
  distance: app.config.distance,
  align: app.config.align,
  verticalAlign: app.config.verticalAlign,
  rotate: app.config.rotate,
  formatter: '',
  fontSize: 12,
  rich: {
    name: {}
  }
};
option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['uav0', 'uav1', 'uav2', '总信息量'],
    textStyle: {
      fontSize: 18
    }
  },
  toolbox: {
    show: true,
    orient: 'vertical',
    left: 'right',
    top: 'center',
    feature: {
      mark: { show: true },
      dataView: { show: true, readOnly: false },
      magicType: { show: true, type: ['line', 'bar', 'stack'] },
      restore: { show: true },
      saveAsImage: { show: true }
    }
  },
  xAxis: [
    {
      type: 'category',
      axisTick: { show: true },
      data: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20'
      ],
      name: '迭代次数',
      nameTextStyle: {
        color: '#000000',  //更改坐标轴文字颜色
        fontSize : 20      //更改坐标轴文字大小
      },
      axisLabel: {
        fontSize: 15,
        fontWeight: 'bold'
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '收益',
      nameTextStyle: {
        color: '#000000',  //更改坐标轴文字颜色
        fontSize : 20      //更改坐标轴文字大小
      },
      axisLabel: {
        fontSize: 15,
        fontWeight: 'bold'
      }
    },
    {
      type: 'value',
      name: '总信息量',
      max: 10000,
      min: 5000,
      boundaryGap: [0.2, 0.2],
      nameTextStyle: {
        color: '#000000',  //更改坐标轴文字颜色
        fontSize : 20      //更改坐标轴文字大小
      },
      axisLabel: {
        fontSize: 15,
        fontWeight: 'bold'
      }
    }
  ],
  axisLabel: {
    show: true,
  },
  series: [
    {
      name: 'uav0',
      type: 'bar',
      barGap: 0,
      label: labelOption,
      emphasis: {
        focus: 'series'
      },
      data: [
          46.5, 44.3, 42.5, 46, 43.2, 38, 36, 40.2, 43.2, 39.3,
          34.5, 38.2, 40.5, 44.6, 39.5, 42.3, 46.8, 48.3, 47.5, 46.1
      ]
    },
    {
      name: 'uav1',
      type: 'bar',
      label: labelOption,
      emphasis: {
        focus: 'series'
      },
      data: [
          42.5, 45.6, 46.9, 39.6, 40.3, 42.5, 43.6, 40.3, 42.8, 37.6,
          -12.5, 36.5, -12.5, 40.3, 43.1, -12.5, 39.2, -12.5, -12.5, 35.3
      ]
    },
    {
      name: 'uav2',
      type: 'bar',
      label: labelOption,
      emphasis: {
        focus: 'series'
      },
      data: [
        43.2, 46.3, 46.5, 39.8, 44.6, 46.5, 42.3, 45.5, 42.2, 39.3,
        38.5, 35.2, 43.5, 42.6, 40.5, 39.3, 38.8, 38.1, 37, 36.5
      ]
    },


    {
      name: '总信息量',
      type: 'line',
      label: labelOption,
      xAxisIndex: 0,
      yAxisIndex: 1,
      data: [
        5438.159307220806,
        5734.464295129196,
        6124.776396849312,
        6256.017828891516,
        6502.772686221615,
        6690.082289592511,
        6857.633536996839,
        7055.5782956913345,
        7277.5835123140505,
        7426.6078484577565,
        7642.964747625839,
        7915.01262153219,
        8146.180721038961,
        8314.76006278191,
        8616.630932824146,
        8849.242508446989,
        9157.06354571509,
        9422.34976808195,
        9537.384315981928,
        9678.901993212405
      ]
    }
  ]
};

// option && myChart.setOption(option);

export {option}
