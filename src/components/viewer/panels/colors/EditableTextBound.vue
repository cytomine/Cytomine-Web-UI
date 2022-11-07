<template>
  <div>
    (
    <span v-if="!editing" @click="editing = true">{{ min }}</span>
    <span v-else>
      <input class="input" v-model="minVal" v-on:keyup.enter="setBounds(minVal, maxVal)"/>
    </span>
    -
    <span v-if="!editing" @click="editing = true">{{ max }}</span>
    <span v-else>
      <input class="input" v-model="maxVal" v-on:keyup.enter="setBounds(minVal, maxVal)"/>
    </span>
    )
  </div>
</template>

<script>
export default {
  name: 'editable-text-bound',
  props: {
    min: Number,
    max: Number,
  },
  data() {
    return {
      editing: false,
      minVal: this.min,
      maxVal: this.max,
    };
  },
  methods: {
    setBounds(min, max) {
      this.editing = false;
      min = Number(min);
      max = Number(max);
      this.$emit('setBounds', {min, max});
    },
  },
};
</script>

<style scoped>
.input {
  font-size: 0.7rem;
  width: 2rem;
}
</style>
