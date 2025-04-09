<template>
  <form @submit.prevent="select">
    <cytomine-modal :active="active" :title="$t('add-inputs')" @close="cancel">
      <div
        :class="{'max-h-64 overflow-y-auto space-y-2 pr-2': items.length <= 5, 'space-y-2 pr-2': items.length > 5}"
        style="overflow-y: auto; max-height: 16rem;"
        @scroll="onScroll"
      >
        <b-field v-for="(value, index) in items" :key="index">
          <b-field position="is-centered" grouped>
            <b-numberinput
              v-model="items[index]"
              :controls="false"
            />
            <b-button @click="remove(index)">
              <i class="fas fa-times"/>
            </b-button>
          </b-field>
        </b-field>
      </div>

      <template #footer>
        <b-button :disabled="maxSize && items.length >= maxSize" @click="add">
          <i class="fas fa-plus"/>
        </b-button>
        <button class="button" type="button" @click="cancel">
          {{ $t('button-cancel') }}
        </button>
        <button class="button is-link">
          {{ $t('select') }}
        </button>
      </template>
    </cytomine-modal>
  </form>
</template>

<script>
import CytomineModal from '@/components/utils/CytomineModal';

export default {
  name: 'ArrayModal',
  components: {
    CytomineModal,
  },
  props: {
    active: {type: Boolean, default: false},
    maxSize: {type: Number, default: null},
    minSize: {type: Number, default: null},
  },
  data() {
    return {
      items: [],
    };
  },
  methods: {
    cancel() {
      this.$emit('update:active', false);
    },
    select() {
      if (this.items.length === 0) {
        this.$notify({type: 'error', text: this.$t('notify-error-empty-list')});
        return;
      }

      if (this.minSize !== null && this.items.length < this.minSize) {
        this.$notify({type: 'error', text: this.$t('notify-error-not-enough-item')});
        return;
      }

      this.$emit('create-inputs', this.items);
      this.$emit('update:active', false);

      this.items = [];

      this.$notify({type: 'success', text: this.$t('notify-success-create-array-inputs')});
    },
    add() {
      this.items.push(0);
    },
    remove(index) {
      this.items.splice(index, 1);
    },
    onScroll(e) {
      const el = e.target;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
        if (this.maxVisible < this.list.length) {
          this.maxVisible += 5;
        }
      }
    },
  },
};
</script>
