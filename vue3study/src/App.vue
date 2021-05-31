<template>
  <router-view></router-view>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Todos from './components/Todos.vue';

@Options({
  components: {
    Todos,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
</style>
