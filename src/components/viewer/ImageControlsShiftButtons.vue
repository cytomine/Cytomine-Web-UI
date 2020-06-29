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
      <v-popover
          placement="left"
          trigger="manual"
          :open="opened"
          :auto-hide="false"
          :popover-inner-class="'tooltip-inner popover-inner step-selector'"
      >
        <button
            class="button is-small item"
            :disabled="!canShift"
            @click="shift(Math.min(step, size - current - 1))"
            @click.right.prevent="startEdition()"
        >
          <i class="fas fa-fast-forward"></i>
          <div class="step-counter">+{{step}}</div>
        </button>

        <template #popover>
          <div
            v-click-outside="() => stopEdition()"
            v-click-outside:contextmenu.capture="() => { stopEdition() }"
            class="step-selector"
          >
            <b-input :placeholder="$t('step')" size="is-small"
               v-model="editedValue"
               ref="inputStepSelector"
               @hook:mounted="focus()"
               @blur="stopEdition()"
               @keyup.enter.native="stopEdition()"
            />
          </div>
        </template>
      </v-popover>
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
  data() {
    return {
      opened: false,
      editedValue: 0,
    };
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
        if (!isNaN(value)) {
          this.$store.commit(this.imageModule + 'setStep', Number(value));
        }
      }
    },
    canShift() {
      return (this.forward) ? (this.current < this.size - 1) : (this.current >= 1);
    }
  },
  methods: {
    shift(value) {
      this.$emit('shift', value);
    },
    startEdition() {
      this.editedValue = this.step;
      this.opened = true;
    },
    stopEdition() {
      this.opened = false;
      if (!this.editedValue || isNaN(this.editedValue)) {
        return;
      }

      this.step = parseInt(this.editedValue);
    },
    focus() {
      this.$refs.inputStepSelector.focus();
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

<style>
  .step-selector {
    padding: 0.1rem 0.3rem !important;
  }

  .step-selector input {
    width: 4rem;
  }
</style>