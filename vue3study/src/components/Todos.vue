<template>
  <div class="container" @mousedown="mouseDown">
    <h1>ToDoList</h1>

    <h3>共有
      <span class="text-primary"> {{ lists.length }} </span>
      个任务，已完成
      <span class="text-success">{{ finished.length }} </span>
    </h3>

    <h3>未完成的列表</h3>

    <ul class="list-group">

      <template v-for="(item, index) in lists">
        <li class="list-group-item d-flex justify-content-between"
            v-if="!item.checked"
            :key="index" @dblclick="showEdit(item, index)">
          <div class="form-group form-check mb-0">
            <label>
              <input type="checkbox" class="form-check-input"
                     :id="'item-' + index" v-model="item.checked"/>

              <label class="form-check-label" v-if="item.isEdit"
                     :for="'item-' + index">
                <input type="text" v-model="editValue" ref="myInput">
              </label>
              <label class="form-check-label" v-else
                     :for="'item-' + index">
                {{ item.name }}
              </label>
            </label>
          </div>

          <button type="button" class="close"
                  aria-label="Close" @click="remove(index)">
            <span aria-hidden="true">&times;</span>
          </button>
        </li>
      </template>

    </ul>

    <h3>已完成的列表</h3>

    <ul class="list-group">
      <li class="list-group-item" v-for="(item, index) in finished"
          :key="'finished-' + index">
        <div class="form-group form-check">
          <label>
            <input type="checkbox" class="form-check-input"
                   :id="'finished-' + index" v-model="item.checked" disabled="disabled"/>

            <label class="form-check-label" :for="'item-' + index">
              {{ item.name }}
            </label>
          </label>
        </div>
      </li>
    </ul>

    <h3>添加新的任务</h3>
    <div class="form-group">
      <label for="add"></label>
      <input
          type="text"
          class="form-control"
          id="add"
          placeholder="增添新的任务"
          v-model="value"
          @keydown.enter="add"/>
    </div>
    <button type="button" class="btn btn-primary btn-lg btn-block"
            @click="add">确定添加
    </button>

    <button type="button" class="btn btn-warning btn-lg btn-block"
            @click="back">返回
    </button>

  </div>
</template>

<script>
import {computed, reactive, toRefs, ref} from 'vue';
import {onBeforeRouteLeave, useRouter} from "vue-router";


export default {

  setup() {
    // 1.加入checkbox ——> checked
    // 2.统计那些 ——> checked ——> finish
    // 3.add添加item ——> item数据结构 ——> name, checked, checked, isEdit
    // 4.双击进行编辑
    // 5.删除功能 ——> 删除特定 index 的
    const add = () => {
      console.log(state)
      state.lists.push({
        name: state.value,
        checked: false,
        isEdit: false
      })
      state.value = ''
    }

    const showEdit = (item, index) => {
      state.editIndex = index;
      item.isEdit = true;
      state.editValue = item.name;
    }

    const myInput = ref(null);

    const remove = index => {
      state.lists.splice(index, 1)
    }

    const mouseDown = (e) => {
      console.log(myInput)
      if (myInput.value && e.target !== myInput.value) {
        state.lists[state.editIndex] = {
          name: state.editValue,
          checked: false,
          isEdit: false,
        }
      }
    }

    // 获取路由器实例
    const router = useRouter();

    const back = () => {

      console.log(router)
      router.push('/');
    }

    const state = reactive({
      lists: [
      ],
      finished: computed(() => {
        return state.lists.filter(item => item.checked === true);
      }),
      value: '',
      add,
      editValue: '',
      editIndex: 0,
      showEdit,
      myInput,
      mouseDown,
      remove,
      back
    })

    onBeforeRouteLeave((to, from) => {
      const answer = window.confirm('你确定要离开当前页面吗?');
      if (!answer)  return false;
    })

    return toRefs(state);
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.form-check-label {

}
</style>


