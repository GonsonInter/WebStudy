<template>
  <div class="home">
    <div id="map-container">
      <Map/>
    </div>
  </div>
</template>

<script>
import Map from 'components/Map';

export default {
  name: 'Home',
  components: { Map }
}
</script>

<style lang="scss">
#map-container {
  margin: 10px;
  height: 820px;
}
</style>
