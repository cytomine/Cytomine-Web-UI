<template>
<cytomine-modal-card :title="$t('associate-tags')" active>
    <template>
      <b-field>
        <domain-tag-input v-model="selectedTags" :domains="notAssociatedTags" placeholder="search-tag" allowNew />
      </b-field>
    </template>

    <div class="explaination">
        <p>{{$t('how-to-add-not-yet-existing-tag')}}</p>
    </div>

    <template #footer>
      <button class="button" @click="$parent.close()">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link" @click="addAssociations">
        {{$t('button-add')}}
      </button>
    </template>
</cytomine-modal-card>
</template>

<script>

import {TagCollection} from 'cytomine-client';
import DomainTagInput from '@/components/utils/DomainTagInput';
import CytomineModalCard from '@/components/utils/CytomineModalCard';

export default {
  name: 'add-tag-modal',
  props: {
    associatedTags: Array
  },
  components: {
    CytomineModalCard,
    DomainTagInput,
  },
  data() {
    return {
      tags: [],
      selectedTags: []
    };
  },
  computed: {
    notAssociatedTags() {
      return this.tags.filter(tag => !this.associatedTags.map(u => u.tag).includes(tag.id));
    }
  },
  methods: {
    async addAssociations() {
      this.$emit('addObjects', this.selectedTags);
      this.$parent.close();
    },
    async fetchTags() {
      this.tags = (await TagCollection.fetchAll()).array;
    },

  },
  async created() {
    this.fetchTags();
  }
};
</script>

<style scoped>
>>> .modal-card, >>> .modal-card-body {
  overflow: visible !important;
  width: 60vw !important;
}

.explaination {
  margin-top: 2rem;
  padding-right: 1.5em;
}

</style>
