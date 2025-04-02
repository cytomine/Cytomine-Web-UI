<template>
  <div class="container">
    <b-field label-position="on-border" expanded class="field">
      <template #label>
        {{ parameter.display_name }}
      </template>
      <b-button @click="selectImage = true">
        {{ $t('select') }}
      </b-button>

      <div class="image-container" v-if="value">
        {{ $t('image') }} {{ value }}
      </div>
    </b-field>

    <div class="info">
      <b-tooltip :label="parameter.description" type="is-primary" position="is-right">
        <b-icon pack="fas" icon="info-circle"/>
      </b-tooltip>
    </div>

    <image-selection :active.sync="selectImage" @select-image="input = $event"/>
  </div>
</template>

<script>
import ImageSelection from '@/components/image/ImageSelection';

export default {
  name: 'WsiField',
  components: {
    ImageSelection,
  },
  props: {
    parameter: {type: Object, required: true},
    value: {},
  },
  data() {
    return {
      selectImage: false,
    };
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
  },
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

.image-container {
  margin-top: 5px;
  margin-left: 10px;
}

.info {
  text-align: right;
  margin-left: 5px;
}
</style>
