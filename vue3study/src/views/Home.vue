<template>
  <div>
    这是Home
  </div>

  <ul>
    <li>
      <a href="#/todos">Todos</a>
    </li>
  </ul>

  <suspense>
    <template #default>
      <AsyncComponent/>
    </template>
    <template v-slot:fallback>
      <h2>Loading......</h2>
    </template>
  </suspense>
</template>

<script>
import AsyncComponent from "@/components/AsyncComponent";

export default {
  name: "Home",

  components: {
    // 这是一个异步组件
    AsyncComponent
  },

  setup(props, context) {

    console.log(props);
    console.log(context);
    console.log('===============');
    console.log('setup函数执行了');

    return {}
  }
}
</script>

<style scoped>

</style>
