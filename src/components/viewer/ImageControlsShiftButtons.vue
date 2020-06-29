<template>
  <div class="buttons has-addons">
    <template v-if="forward">
      <button
          class="button is-small item"
          :disabled="!canShift"
          @click="shift(1)"
      >
        <i class="fas fa-step-forward"></i>
      </button>
      <button
          class="button is-small item"
          :disabled="!canShift"
          @click="shift(Math.min(step, size - current - 1))"
      >
        <i class="fas fa-fast-forward"></i>
        <div class="step-counter">+{{step}}</div>
      </button>
    </template>
    <template v-else>
      <button
          class="button is-small item"
          :disabled="!canShift"
          @click="shift(-Math.min(step, current))"
      >
        <i class="fas fa-fast-backward"></i>
        <div class="step-counter">-{{step}}</div>
      </button>
      <button
          class="button is-small item"
          :disabled="!canShift"
          @click="shift(-1)"
      >
        <i class="fas fa-step-backward"></i>
      </button>
    </template>

  </div>
</template>

<script>
export default {
  name: 'ImageControlsShiftButtons',
  props: {
    index: String,
    forward: Boolean,
    current: Number,
    size: Number,
  },
  computed: {
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    viewerWrapper() {
      return this.$store.getters['currentProject/currentViewer'];
    },
    imageWrapper() {
      return this.viewerWrapper.images[this.index];
    },
    step: {
      get() {
        return this.imageWrapper.controls.step;
      },
      set(value) {
        this.$store.dispatch(this.imageModule + 'setStep', value);
      }
    },
    canShift() {
      return (this.forward) ? (this.current < this.size - 1) : (this.current >= 1);
    }
  },
  methods: {
    shift(value) {
      this.$emit('shift', value);
    }
  }
};
</script>

<style lang="scss" scoped>
  .buttons {
    float:left;
    margin: 1px;
    margin-bottom: 0 !important;

    .button {
      margin-bottom: 0;
    }
  }

  .step-counter {
    position: absolute;
    top: 0.25em;
    right: 0.25em;
    font-size: 0.7em;
    font-weight: 600;
    text-align:right;
    line-height: 0.9em;
  }

</style>