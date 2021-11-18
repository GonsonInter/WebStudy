<template>
  <div class="home">
    <div id="map-container">
      <Map @dataChange="handleDataChange"/>
    </div>

    <div id="graph-container">
      <div id="main" style="width: 100%; height: 100%"></div>
    </div>
  </div>
</template>

<script>
import Map from 'components/Map';
import { option } from '@/dataprocess/drawChart';
import * as echarts from 'echarts';

export default {
  name: 'Home',
  components: { Map },
  data() {
    return {
      data: [
          []
      ]
    }
  },
  methods: {
    handleDataChange(data) {
      console.log('数据传送', data);
    }
  },

  mounted() {
    let chartDom = document.getElementById('main');
    let myChart = echarts.init(chartDom);
    option && myChart.setOption(option);
  }
}
</script>

<style lang="scss">
#map-container {
  margin: 10px;
  height: 820px;
}

#graph-container {
  height: 1000px;
}
</style>
