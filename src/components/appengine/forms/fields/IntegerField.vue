<template>
  <div class="container">
    <b-field :label="parameter.display_name" label-position="on-border" expanded class="field">
      <b-numberinput
        v-model="input"
        :placeholder="parameter.default"
        :controls="false"
        :max="max"
        :min="min"
      />
    </b-field>
    <div class="info">
      <b-tooltip :label="parameter.description" type="is-primary" position="is-right">
        <b-icon pack="fas" icon="info-circle" />
      </b-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IntegerField',
  props: {
    parameter: {
      type: Object
    },
    value: {
      type: Number
    }
  },
  data() {
    return {
      input: this.parameter.default || 0
    };
  },
  computed: {
    type() {
      return this.parameter.type;
    },
    min() {
      let min = null;
      let {gt, geq} = this.type;
      if (!!geq || geq === 0) {
        min = geq;
      }
      if (!!gt || gt === 0) {
        min = gt + 1;
      }
      return min;
    },
    max() {
      let max = null;
      let {lt, leq} = this.type;
      if (!!leq || leq === 0) {
        max = leq;
      }
      if (!!lt || lt === 0) {
        max = lt - 1;
      }
      return max;
    }
  },
  watch: {
    input() {
      this.$emit('input', this.input);
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field {
  flex: 1;
}

.info {
  text-align: right;
  margin-left: 5px;
}
</style>