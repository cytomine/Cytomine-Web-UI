<template>
  <div class="container">
    <b-field label-position="on-border" expanded class="field">
      <template #label>
        {{ parameter.display_name }}
      </template>
      <b-numberinput
        v-model="input"
        :placeholder="constraintsSummary"
        :controls="false"
        :max="max"
        :min="min"
      />
    </b-field>
    <div class="info">
      <b-tooltip :label="tooltip" type="is-primary" position="is-right">
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
    value: { }
  },
  computed: {
    input: {
      get() {
        return this.value || this.defaultValue;
      },
      set(value) {
        this.$emit('input', value);
      }
    },
    defaultValue() {
      return this.parameter.default != null ? this.parameter.default : null;
    },
    type() {
      return this.parameter.type;
    },
    hasConstraints() {
      let {gt, lt, geq, leq} = this.type;
      return gt != null || lt != null || geq != null || leq != null;
    },
    constraintsSummary() {
      let {gt, lt, geq, leq} = this.type;
      let summary = '';
      if (!!geq || geq === 0) {
        summary += `${geq} ≤ `;
      } else if (!!gt || gt === 0) {
        summary += `${gt} < `;
      }
      summary += this.parameter.display_name;
      if (!!leq || leq === 0) {
        summary += ` ≤ ${leq}`;
      } else if (!!lt || lt === 0) {
        summary += ` < ${lt}`;
      }
      return summary;
    },
    tooltip() {
      let tooltip = this.parameter.description;
      if (this.hasConstraints) {
        tooltip += `, ${this.constraintsSummary}`;
      }
      return tooltip;
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