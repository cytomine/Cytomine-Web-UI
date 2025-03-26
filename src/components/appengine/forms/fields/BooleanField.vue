<template>
  <div class="container">
    <b-field class="field" expanded>
      <span class="display-name">{{ parameter.display_name }}</span>
      <b-radio v-model="input" :native-value="true">True</b-radio>
      <b-radio v-model="input" :native-value="false">False</b-radio>
    </b-field>

    <div class="info">
      <b-tooltip :label="tooltip" type="is-primary" position="is-right">
        <b-icon pack="fas" icon="info-circle"/>
      </b-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BooleanField',
  props: {
    parameter: {type: Object, required: true},
    value: {},
  },
  computed: {
    input: {
      get() {
        return this.value !== undefined ? this.value : this.defaultValue;
      },
      set(value) {
        this.$emit('input', value);
      }
    },
    defaultValue() {
      return this.parameter.default !== null ? !this.parameter.default : null;
    },
    tooltip() {
      return this.parameter.description;
    },
  },
  watch: {
    value(newValue) {
      if (newValue === null && this.defaultValue !== null) {
        this.input = this.defaultValue;
      }
    }
  },
  created() {
    if (this.defaultValue !== null) {
      this.input = this.defaultValue;
    }
  },
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.display-name {
  font-weight: bold;
  margin-right: 10px;
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
