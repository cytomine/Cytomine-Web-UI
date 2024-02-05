<template>
  <b-table :data="parameters" narrowed>
    <template #default="props">
      <b-table-column field="name" :label="$t('app-engine.parameter.name')">
        {{ props.row.param_name }}
      </b-table-column>
      <b-table-column field="type" :label="$t('app-engine.parameter.type')">
        {{ props.row.type }}
      </b-table-column>
      <b-table-column field="value" :label="$t('app-engine.parameter.value')">
        {{ props.row.value }}
      </b-table-column>
    </template>
  </b-table>
</template>

<script>
export default {
  name: 'TaskRunParametersTable',
  props: {
    parameters: {
      type: Array,
      required: true
    },
  }
};
</script>
