<template>
  <h2>
    我是一个新的组件
  </h2>
  <h3>
    {{ msg }}
  </h3>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: "AsyncComponent",

  setup(props, context) {

    console.log(props);
    console.log(context);
    console.log('===============');
    console.log('setup函数执行了');

    return new Promise((resolve, reject) => {
      setTimeout(() => {resolve({
        msg: 'wadwdwsdaw',
      })}, 2000);
    })
  }
})
</script>

<style scoped>

</style>
