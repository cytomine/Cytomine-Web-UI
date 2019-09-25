<template>
<cytomine-modal :active="active" :title="$t('associate-tags')" @close="$emit('update:active', false)">
    <b-loading :is-full-page="false" :active="loading" class="small" />
    <template v-if="!loading">
      <b-field>
        <domain-tag-input v-model="selectedTags" :domains="notAssociatedTags" placeholder="search-tag" allowNew />
      </b-field>
    </template>

    <template #footer>
      <button class="button" @click="$emit('update:active', false)">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link" @click="addAssociations">
        {{$t('button-add')}}
      </button>
    </template>
</cytomine-modal>
</template>

<script>

import {TagCollection} from 'cytomine-client';
import DomainTagInput from '@/components/utils/DomainTagInput';
import CytomineModal from '@/components/utils/CytomineModal';

export default {
  name: 'add-tag-modal',
  props: {
    active: Boolean,
    associatedTags: Array
  },
  components: {
    CytomineModal,
    DomainTagInput,
  },
  data() {
    return {
      loading: true,
      tags: [],
      selectedTags: []
    };
  },
  computed: {
    notAssociatedTags() {
      return this.tags.filter(tag => !this.associatedTags.map(u => u.tag).includes(tag.id));
    }
  },
  watch: {
    active(val) {
      this.selectedTags = [];
      if(val) {
        this.fetchTags();
      }
    }
  },
  methods: {
    async addAssociations() {
      this.$emit('addObjects', this.selectedTags);
      this.$emit('update:active', false);
    },
    async fetchTags() {
      this.tags = (await TagCollection.fetchAll()).array;
    },

  },
  async created() {
    this.fetchTags();
    this.loading = false;
  }
};
</script>

<style scoped>
>>> .modal-card, >>> .modal-card-body {
  overflow: visible !important;
  width: 60vw !important;
}
</style>
