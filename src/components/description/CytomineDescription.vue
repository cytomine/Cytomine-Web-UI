<template>
<div :class="['description-wrapper', loading ? 'loading' : '']">
  <b-loading :is-full-page="false" :active="loading" class="small" />
  <template v-if="!loading">
    <template v-if="definedDescription">
      <div class="ql-snow">
        <div class="ql-editor" v-html="previewDescription"></div> <!-- WARNING can lead to js injection -->
      </div>
      <a @click="openModal(false)"> {{ $t('see-full-text') }} </a>
      <template v-if="canEdit">
        {{ $t('or') }}
        <a @click="openModal(true)"> {{ $t('edit') }} </a>
      </template>
    </template>
    <template v-else>
      <em>{{$t('no-description')}}</em>
      <a v-if="canEdit" @click="openModal(true)"> {{ $t('add-one') }} </a>
    </template>
  </template>
</div>
</template>

<script>
import {Description} from 'cytomine-client';
import DescriptionModal from './CytomineDescriptionModal';

import constants from '@/utils/constants.js';

export default {
  name: 'cytomine-description',
  props: {
    object: {type: Object},
    canEdit: {type: Boolean, default: true},
    maxPreviewLength: {type: Number, default: 0} // if set to 0, the description preview is not limited unless stop preview keyword is present
  },
  data() {
    return {
      loading: true,
      description: null,
      modalOpened: false
    };
  },
  computed: {
    definedDescription() {
      return !this.description.isNew();
    },
    previewDescription() {
      if(!this.description) {
        return null;
      }

      let posStop = this.description.data.indexOf(constants.STOP_PREVIEW_KEYWORD);
      if(posStop !== -1) {
        return this.description.data.substring(0, posStop);
      }
      else if(this.maxPreviewLength && this.description.data.length > this.maxPreviewLength) {
        return this.description.data.substring(0, this.maxPreviewLength) + '...';
      }
      else {
        return this.description.data;
      }
    }
  },
  methods: {
    openModal(edit) {
      // required to use programmatic modal because the description is sometimes displayed in elements with a
      // CSS transform (e.g. popover) that conflict with the fixed position of the modal
      // (http://meyerweb.com/eric/thoughts/2011/09/12/un-fixing-fixed-elements-with-css-transforms/)

      this.$modal.open({
        parent: this,
        component: DescriptionModal,
        props: {description: this.description, edit},
        hasModalCard: true
      });
    }
  },
  async created() {
    try {
      this.description = await Description.fetch(this.object);
    }
    catch(err) {
      // the error may make sense if the object has no description
      this.description = new Description({data: '', object: this.object});
    }
    this.loading = false;
  }

};
</script>

<style scoped>
.description-wrapper {
  position: relative;
}

.description-wrapper .ql-editor {
  padding: 0px;
  white-space: normal;
}

.description-wrapper.loading {
  min-height: 3em;
}
</style>
