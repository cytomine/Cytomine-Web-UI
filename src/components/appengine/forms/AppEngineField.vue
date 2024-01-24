<template>
  <div>
    <integer-field v-if="typeId == 'integer'" :parameter="parameter" v-model="input"></integer-field>
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
  data() {
    return {
      input: null
    };
  },
  computed: {
    typeId() {
      return this.parameter.type.id;
    }
  },
  // v-model event
  watch: {
    input() {
      this.$emit('input', this.input);
    }
  }
};
</script>
