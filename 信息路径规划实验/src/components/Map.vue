<template>
  <div id="indoor-map">
    <canvas id="axis" style="z-index: 0"></canvas>
    <canvas id="grid" style="z-index: 1"></canvas>
    <canvas id="obstacles" style="z-index: 1"></canvas>
    <canvas id="uav-path" style="z-index: 4" v-show="uavShown"></canvas>
    <canvas id="color-bar" style="z-index: 2" v-show="infoShown"></canvas>
    <canvas id="information" style="z-index: 3" v-show="infoShown"></canvas>

    <div class="switch-panel">
      <el-switch
          v-model="uavShown"
          active-text="无人机路径显示"
      />
      <el-switch
          v-model="infoShown"
          active-text="信息量显示"
      />
    </div>
  </div>
</template>

<script>
const GRID_LENGTH = 25;    // 网格粒度
const MAP_WIDTH = 40;
const MAP_HEIGHT = 28;
const AXIS_INTERVAL = 40;  // 坐标轴的边距
const ARROW_SIZE = 10;
const AXIS_TEXT_SIZE = 12;   // 坐标轴刻度字体大小
const COLOR_BAR_WIDTH = 30;
const DATA_RANGE = [-50, 0];

import { ObstacleMap } from 'assets/ObstacleMap';
import { Map2D } from '@/dataprocess/dataProcess';

export default {
  name: "Map",
  data() {
    return {
      mapHeight: 0,
      mapWidth: 0,
      x0: 0,
      y0: 0,
      ObstacleMap,
      uavShown: true,
      infoShown: true,
      colorBarX0: 0,
      colorBarY0: 0,
      colorBarX1: 0,
      colorBarY1: 0,
      map2d: null
    }
  },
  methods: {

    init() {
      let map = document.getElementById('indoor-map');
      this.mapHeight = map.clientHeight;
      this.mapWidth = map.clientWidth;
      let axis = document.getElementById('axis');
      // 给坐标轴设宽度和高度
      axis.width = this.mapWidth;
      axis.height = this.mapHeight;
      this.x0 = AXIS_INTERVAL;
      this.y0 = this.mapHeight - AXIS_INTERVAL;
      this.drawAxis();

      // 设置取色条
      let colorBar = document.getElementById('color-bar');
      colorBar.width = this.mapWidth;
      colorBar.height = this.mapHeight;
      this.initColorBar();

      // 设置网格
      let grid = document.getElementById('grid');
      grid.width = this.mapWidth;
      grid.height = this.mapHeight;
      this.drawGrids();

      // 设置障碍物
      let obstacles = document.getElementById('obstacles');
      obstacles.width = this.mapWidth;
      obstacles.height = this.mapHeight;
      // 读取的配置文件
      this.initObstacles(this.ObstacleMap);

      // 无人机图层
      let uav = document.getElementById('uav-path');
      uav.width = this.mapWidth;
      uav.height = this.mapHeight;

      const {setUAV} = this;

      setUAV(28, 15, 'lead');
      setUAV(26, 7);
      setUAV(21, 19);

      // 无人机图层
      let info = document.getElementById('information');
      info.width = this.mapWidth;
      info.height = this.mapHeight;

      this.map2d = new Map2D();

    },

    drawAxis() {
      let axis = document.getElementById('axis');
      let ctx = axis.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#000';
      ctx.strokeWidth = '2px';
      ctx.font = AXIS_TEXT_SIZE + "px Arial";

      for (let i = 0; i < 2; i++) {
        // 绘制x轴
        ctx.beginPath();
        ctx.moveTo(this.x0, this.y0);
        ctx.lineTo(this.x0 + (MAP_WIDTH + 1) * GRID_LENGTH, this.y0);
        ctx.lineTo(this.x0 + (MAP_WIDTH + 1) * GRID_LENGTH + ARROW_SIZE * Math.cos(10),
            this.y0 - ARROW_SIZE * Math.sin(10));
        ctx.lineTo(this.x0 + (MAP_WIDTH + 1) * GRID_LENGTH + ARROW_SIZE * Math.cos(10),
            this.y0 + ARROW_SIZE * Math.sin(10));
        ctx.lineTo(this.x0 + (MAP_WIDTH + 1) * GRID_LENGTH, this.y0);
        ctx.stroke();
        ctx.fill();

        // 绘制y轴
        ctx.beginPath();
        ctx.moveTo(this.x0, this.y0);
        ctx.lineTo(this.x0, this.y0 - (MAP_HEIGHT + 1) * GRID_LENGTH);
        ctx.lineTo(this.x0 - ARROW_SIZE * Math.sin(10),
            this.y0 - (MAP_HEIGHT + 1) * GRID_LENGTH - ARROW_SIZE * Math.cos(10));
        ctx.lineTo(this.x0 + ARROW_SIZE * Math.sin(10),
            this.y0 - (MAP_HEIGHT + 1) * GRID_LENGTH - ARROW_SIZE * Math.cos(10));
        ctx.lineTo(this.x0, this.y0 - (MAP_HEIGHT + 1) * GRID_LENGTH);
        ctx.stroke();
        ctx.fill();
      }

      // 绘制坐标刻度
      ctx.textAlign = "center";
      for (let i = 0; i < MAP_WIDTH; i++) {
        ctx.moveTo(this.x0 + GRID_LENGTH / 2 + GRID_LENGTH * i, this.y0);
        ctx.lineTo(this.x0 + GRID_LENGTH / 2 + GRID_LENGTH * i, this.y0 + 5);
        ctx.fillText(i, this.x0 + GRID_LENGTH / 2 + GRID_LENGTH * i - AXIS_TEXT_SIZE / 2 + AXIS_TEXT_SIZE / 2,
            this.y0 + 20);
      }
      ctx.textAlign = "right";
      for (let i = 0; i < MAP_HEIGHT; i++) {
        ctx.moveTo(this.x0, this.y0 - GRID_LENGTH / 2 - GRID_LENGTH * i);
        ctx.lineTo(this.x0 - 5, this.y0 - GRID_LENGTH / 2 - GRID_LENGTH * i);
        ctx.fillText(i, this.x0 - 1.3 * AXIS_TEXT_SIZE, this.y0 - GRID_LENGTH / 2 - GRID_LENGTH * i + AXIS_TEXT_SIZE / 2 - 2);
      }
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.fillText('X轴', this.x0 + (MAP_WIDTH + 1) * GRID_LENGTH, this.y0 + 20);
      ctx.textAlign = "right";
      ctx.fillText('Y轴', this.x0 - AXIS_TEXT_SIZE, this.y0 - (MAP_HEIGHT + 1) * GRID_LENGTH);
    },

    drawGrids() {
      let grid = document.getElementById('grid');
      let ctx = grid.getContext('2d');
      ctx.strokeStyle = '#b4b1b1';
      ctx.strokeWidth = '1px';
      for (let i = 1; i <= MAP_WIDTH; i++) {
        ctx.moveTo(this.x0 + i * GRID_LENGTH, this.y0);
        ctx.lineTo(this.x0 + i * GRID_LENGTH, this.y0 - GRID_LENGTH * MAP_HEIGHT);
      }
      for (let i = 1; i <= MAP_HEIGHT; i++) {
        ctx.moveTo(this.x0, this.y0 - i * GRID_LENGTH);
        ctx.lineTo(this.x0 + GRID_LENGTH * MAP_WIDTH, this.y0 - i * GRID_LENGTH);
      }
      ctx.stroke();
    },

    initColorBar() {

      let colorBarX0 = this.x0 + (MAP_WIDTH + 3) * GRID_LENGTH,
          colorBarY0 = this.y0 - 20;

      let colorBarY1 = this.y0 - MAP_HEIGHT * GRID_LENGTH + 20;      // 取色条两个坐标
      let colorBarHeight = colorBarY0 - colorBarY1;

      // 给this赋值
      this.colorBarX0 = colorBarX0;
      this.colorBarY0 = colorBarY0;
      this.colorBarX1 = colorBarX0;
      this.colorBarY1 = colorBarY1;

      let colorBar = document.getElementById('color-bar');
      let ctx = colorBar.getContext('2d');
      let gradient = ctx.createLinearGradient(
          colorBarX0,
          colorBarY0,
          colorBarX0,
          colorBarY1
      );
      gradient.addColorStop(1, "rgb(255,0,0)")
      gradient.addColorStop(0.875, "rgb(253,89,0)")
      gradient.addColorStop(0.625, "rgba(255,255,0,1)")
      gradient.addColorStop(0.375, "rgba(0,255,255,1)")
      gradient.addColorStop(0.125, "rgb(4,4,191)")
      gradient.addColorStop(0, "rgb(1,1,85)")
      ctx.fillStyle = gradient;
      ctx.fillRect(
          colorBarX0,
          colorBarY1,
          COLOR_BAR_WIDTH,
          colorBarHeight
      );

      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#000';
      ctx.font = AXIS_TEXT_SIZE + "px Arial";
      for (let i = 0; i <= 5; i++) {
        ctx.moveTo(colorBarX0 + COLOR_BAR_WIDTH, colorBarY0 - colorBarHeight / 5 * i);
        ctx.lineTo(colorBarX0 + COLOR_BAR_WIDTH + 5, colorBarY0 - colorBarHeight / 5 * i);
        ctx.fillText(DATA_RANGE[0] + (DATA_RANGE[1] - DATA_RANGE[0]) / 5 * i,
            colorBarX0 + COLOR_BAR_WIDTH + 10,
            colorBarY0 - colorBarHeight / 5 * i + AXIS_TEXT_SIZE / 2 - 2
        );
      }
      ctx.stroke();
    },

    selectColor(value) {
      let color;
      if (value <= DATA_RANGE[0]) {
        color = {
          r: 1,
          g: 1,
          b: 85,
          a: 255
        }
      } else if (value >= DATA_RANGE[1]) {
        color = {
          r: 255,
          g: 0,
          b: 0,
          a: 255
        }
      } else {
        let ctx = document.getElementById('color-bar').getContext('2d');
        let disRate = (value - DATA_RANGE[0]) / (DATA_RANGE[1] - DATA_RANGE[0]);

        let pixel = ctx.getImageData(
            this.colorBarX0 + 0.5 * COLOR_BAR_WIDTH,
            this.colorBarY0 - disRate * (this.colorBarY0 - this.colorBarY1),
            1,
            1
        );

        color = {
          r: pixel.data[0],
          g: pixel.data[1],
          b: pixel.data[2],
          a: pixel.data[3]
        }
      }

      return color;
    },

    // 根据坐标获取实际位置
    getPosByCord(x, y) {
      if (x >= MAP_WIDTH) {
        return this.$message.error(`横坐标${x}超过了范围${MAP_WIDTH}`);
      }
      if (y >= MAP_HEIGHT) {
        return this.$message.error(`横坐标${y}超过了范围${MAP_HEIGHT}`);
      }
      return [
        this.x0 + (x + 0.5) * GRID_LENGTH,
        this.y0 - (y + 0.5) * GRID_LENGTH
      ];
    },

    // 根据坐标填充颜色
    fillByCord(ctx, x, y, color) {
      const { getPosByCord } = this;
      ctx.fillStyle = color;
      if (typeof color === 'string') {
        ctx.fillStyle = color;
      } else {
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a || 1})`;
      }
      ctx.fillRect(...getPosByCord(x, y).map(item => {
        return item - GRID_LENGTH / 2;
      }), GRID_LENGTH, GRID_LENGTH)
    },

    initObstacles(arr) {
      let obstacles = document.getElementById('obstacles');
      let ctx = obstacles.getContext('2d');

      arr.forEach(pos => {
        this.fillByCord(ctx, ...pos, '#000');    // 障碍物填充为黑色
      })
    },

    setUAV(x, y, type = 'normal') {
      let uav_path = document.getElementById('uav-path');
      let ctx = uav_path.getContext('2d');
      let img = new Image();
      img.src = require('assets/uav-normal.png');
      if (type === 'lead') {
        img.src = require('assets/uav-lead.png');
      }
      img.onload = () => {
        ctx.drawImage(img, ...this.getPosByCord(x, y).map(item => {
          return item - GRID_LENGTH / 2;
        }), GRID_LENGTH, GRID_LENGTH);
      }
    }
  },
  mounted() {
    this.init();
  }
}
</script>

<style scoped lang="scss">

#indoor-map {
  // background-color: #dedddd;
  height: 100%;
  width: 100%;
  position: relative;
  display: inline-block;
  float: left;

  canvas {
    position: absolute;
    left: 0;
    top: 0;
  }
}

.switch-panel {
  z-index: 100;
  position: absolute;

  .el-switch {
    display: inline-block;
    margin-right: 30px;
  }
}
</style>
