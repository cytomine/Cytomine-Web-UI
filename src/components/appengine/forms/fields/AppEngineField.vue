<template>
  <div>
    <integer-field v-if="typeId == 'integer'" @input="$emit('input', $event)" :parameter="parameter" v-model="input"></integer-field>
  </div>
</template>

<script>
import IntegerField from '@/components/appengine/forms/fields/IntegerField.vue';

export default {
  name: 'AppEngineField',
  components: {
    IntegerField
  },
  props: {
    parameter: {
      type: Object
    },
    value: { }
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
    }
  }
};
</script>

