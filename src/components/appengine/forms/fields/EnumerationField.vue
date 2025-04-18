<template>
  <div class="is-flex is-justify-content-center">
    <b-field class="field" label-position="on-border" expanded>
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
      <b-tooltip v-if="tooltip" :label="tooltip" type="is-primary" position="is-right">
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
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    },
    tooltip() {
      return this.parameter.description;
    }
  },
};
</script>

<style scoped>
.field {
  margin-left: auto;
  margin-right: auto;
}

.info {
  text-align: right;
  margin-left: 5px;
}
</style>
