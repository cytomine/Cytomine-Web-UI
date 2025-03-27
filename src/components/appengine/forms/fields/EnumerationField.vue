<template>
  <div class="container">
    <b-field label-position="on-border" expanded class="field">
      <template #label>
        {{ parameter.display_name }}
      </template>
      <b-select
        v-model="input"
        :placeholder="parameter.display_name"
      >
        <option
          v-for="option in parameter.type.values"
          :value="option"
          :key="option"
        >
          {{ option }}
        </option>
      </b-select>
    </b-field>
    <div class="info">
      <b-tooltip :label="parameter.description" type="is-primary" position="is-right">
        <b-icon pack="fas" icon="info-circle"/>
      </b-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnumerationField',
  props: {
    parameter: {type: Object, required: true},
    value: {},
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
      let isNull = this.parameter.default == null || this.parameter.default === '';
      return !isNull ? this.parameter.default : null;
    },
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
  margin-left: auto;
  margin-right: auto;
}

.info {
  text-align: right;
  margin-left: 5px;
}
</style>
