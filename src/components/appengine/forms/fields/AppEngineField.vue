<template>
  <component v-model="input" :is="currentField" :parameter="parameter" @input="$emit('input', $event)"/>
</template>

<script>
import BooleanField from '@/components/appengine/forms/fields/BooleanField';
import IntegerField from '@/components/appengine/forms/fields/IntegerField';
import NumberField from '@/components/appengine/forms/fields/NumberField';

export default {
  name: 'AppEngineField',
  components: {
    BooleanField,
    IntegerField,
    NumberField,
  },
  props: {
    parameter: {type: Object, required: true},
    value: {}
  },
  computed: {
    typeId() {
      return this.parameter.type.id;
    },
    input: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    },
    currentField() {
      switch (this.typeId) {
        case 'boolean':
          return BooleanField;
        case 'integer':
          return IntegerField;
        case 'number':
          return NumberField;
        default:
          return null;
      }
    },
  }
};
</script>
