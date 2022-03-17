import * as echarts from 'echarts';

let app = {};

// var chartDom = document.getElementById('main');
// var myChart = echarts.init(chartDom);
let option1;

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
    myChart1.setOption({
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
option1 = {
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
      nameGap: 80,
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
        47.3, 46.8, 48.2, 45.6, 43.5, 37.5, 38.5, 39.5, 43.7, 42.5,
        42.8, 38.7, 40.3, 39.1, 39.5, 43.2, 35.6, 33.2, 35.8, 34.5
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
        44.5, 42.6, 44.6, 39.4, 46.2, 43.5, 38.5, 39.7, 42.5, 44.6,
        42.8, 41.7, 36.8, 37.6, 39.8, 39.5, 41.3, 39.6, 38.2, 38.8
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
        42.3, 41.3, 40.5, 43.2, 42.6, 41.3, 39.5, 41.4, 42.2, 39.7,
        39.2, 41.6, 42.5, 42.9, 43.5, 38.9, 43.8, 40.6, 41.3, 38.2
      ]
    },


    {
      name: '总信息量',
      type: 'line',
      label: labelOption,
      xAxisIndex: 0,
      yAxisIndex: 1,
      data: [
        5497.427698648208,
        5964.75925794187,
        6436.78003783552,
        6731.201583792919,
        6886.4540838247585,
        6986.983673123277,
        7087.593020457133,
        7125.0679730888,
        7137.922826568652,
        7190.403812195192,
        7276.643593630554,
        7299.374823994392,
        7348.184031535401,
        7388.097961710234,
        7434.214734732608,
        7438.396845858752,
        7468.43241217563,
        7480.881264310643,
        7485.060979375145,
        7497.357685426506
      ]
    }
  ]
};

// option && myChart.setOption(option);

export {option1}
