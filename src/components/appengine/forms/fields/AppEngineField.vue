<template>
  <component v-model="input" :is="currentField" :parameter="parameter" @input="$emit('input', $event)"/>
</template>

<script>
import BooleanField from '@/components/appengine/forms/fields/BooleanField';
import EnumerationField from '@/components/appengine/forms/fields/EnumerationField';
import IntegerField from '@/components/appengine/forms/fields/IntegerField';
import NumberField from '@/components/appengine/forms/fields/NumberField';
import StringField from '@/components/appengine/forms/fields/StringField';

export default {
  name: 'AppEngineField',
  components: {
    BooleanField,
    EnumerationField,
    IntegerField,
    NumberField,
    StringField,
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
        case 'enumeration':
          return EnumerationField;
        case 'integer':
          return IntegerField;
        case 'number':
          return NumberField;
        case 'string':
          return StringField;
        default:
          return null;
      }
    },
  }
};
</script>
