<template>
<div class="panel">
  <div class="panel-block has-text-grey" v-if="filteredViews.length === 0">
    <em>{{$t('open-view-select-annot-to-link')}}</em>
  </div>
  <template v-else>
    <a
      class="panel-block"
      :class="{'is-disabled': isViewDisabled(view)}"
      v-for="view in filteredViews"
      :key="`annot-link-${index}-${view.index}`"
      @click="link(view)"
    >
      {{$t('selection-in-view', {number: view.index+1})}} (<image-name :image="view.imageInstance" />) <br>
      <em class="has-text-grey is-size-7" v-if="!view.sameImageGroup">{{$t('different-image-group')}}</em>
      <em class="has-text-grey is-size-7" v-else-if="view.sameAnnotationGroup">{{$t('already-linked')}}</em>
      <em class="has-text-grey is-size-7" v-else-if="!view.annot">{{$t('no-selected-annot')}}</em>
      <annotation-links-preview
        v-else
        :size="32"
        :main-color="mainColor"
        :link-color="linkColor"
        :show-main-annotation="true"
        :annotation="view.annot"
        :images="images"
      />
    </a>
  </template>
</div>
</template>


<script>
import {get} from '@/utils/store-helpers';
import ImageName from '@/components/image/ImageName';
import AnnotationLinksPreview from '@/components/annotations/AnnotationLinksPreview';

import {AnnotationGroup, AnnotationLink} from 'cytomine-client';
import {listAnnotationsInGroup} from '@/utils/annotation-utils';

export default {
  name: 'annotation-link-selector',
  components: {ImageName, AnnotationLinksPreview},
  props: {
    index: String
  },
  data() {
    return {
      loading: true,
      error: false,

      mainColor: '0099ff',
      linkColor: '696969'
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    viewerModule() {
      return this.$store.getters['currentProject/currentViewerModule'];
    },
    viewerWrapper() {
      return this.$store.getters['currentProject/currentViewer'];
    },
    imageGroupId() {
      return (this.imageWrapper.imageGroupLink) ? this.imageWrapper.imageGroupLink.group : null;
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    images() {
      if (this.imageWrapper.imageGroup) {
        return [this.image, ...this.imageWrapper.imageGroup.imageInstances];
      }
      return [this.image];
    },
    selectedFeature() {
      return this.$store.getters[this.imageModule + 'selectedFeature'];
    },
    annotation() {
      return this.selectedFeature.properties.annot;
    },
    annotationGroupId() {
      return this.annotation.group;
    },
    views() {
      return Object.values(this.viewerWrapper.images).map((wrapper, index) => {
        let groupId = (wrapper.imageGroupLink) ? wrapper.imageGroupLink.group : null;
        let selectedFeatures = wrapper.selectedFeatures.selectedFeatures;
        let feature = ((selectedFeatures.length === 1)) ? selectedFeatures[0] : null;
        let annot = (feature) ? feature.properties.annot : null;
        return {
          index: index,
          imageInstance: wrapper.imageInstance,
          imageId: wrapper.imageInstance.id,
          imageGroupId: groupId,
          sameImageGroup: groupId === this.imageGroupId,
          annot: annot,
          annotationGroupId: (annot) ? annot.group : null,
          sameAnnotationGroup: (annot && annot.group) ? annot.group === this.annotationGroupId : false,
        };
      }).sort((a, b) => {
        if (!this.isViewDisabled(a) && this.isViewDisabled(b)) {
          return -1;
        }
        if (this.isViewDisabled(a) && !this.isViewDisabled(b)) {
          return 1;
        }
        return a.index - b.index;
      });
    },
    filteredViews() {
      return this.views.filter(view => view.index !== Number(this.index) && view.sameImageGroup);
    }
  },
  methods: {
    isViewDisabled(view) {
      return !view.sameImageGroup || view.sameAnnotationGroup || !view.annot;
    },

    async link(view) {
      if (this.isViewDisabled(view)) {
        return;
      }

      try {
        let group;
        if (!this.annotationGroupId && !view.annotationGroupId) {
          let annotGroup = await new AnnotationGroup({
            imageGroup: this.imageGroupId,
            project: this.image.project,
            type: 'SAME_OBJECT'
          }).save();
          group = annotGroup.id;
          await Promise.all([
            new AnnotationLink(
              {annotationIdent: this.annotation.id, image: this.annotation.image, group}
            ).save(),
            new AnnotationLink(
              {annotationIdent: view.annot.id, image: view.annot.image, group}
            ).save()
          ]);
        }
        else if (!this.annotationGroupId && view.annotationGroupId) {
          let group = view.annotationGroupId;
          await new AnnotationLink(
            {annotationIdent: this.annotation.id, image: this.annotation.image, group}
          ).save();
        }
        else if (this.annotationGroupId && !view.annotationGroupId) {
          let group = this.annotationGroupId;
          await new AnnotationLink(
            {annotationIdent: view.annot.id, image: view.annot.image, group}
          ).save();
        }
        else {
          let annotGroup = await AnnotationGroup.fetch(this.annotationGroupId);
          await annotGroup.merge(view.annotationGroupId);
          group = annotGroup.id;
        }

        (await listAnnotationsInGroup(this.image.project, group)).forEach(a => {
          this.$eventBus.$emit('editAnnotation', a);
        });
        this.$notify({type: 'success', text: this.$t('notif-success-annotation-link-creation')});

      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-annotation-link-creation')});
      }
    },
  },
};
</script>

<style scoped>
.panel-block:last-of-type {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.panel-block:first-of-type {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.is-disabled {
  cursor: default;
  color: #7a7a7a !important;
}

.panel {
  font-size: 0.9rem;
}

.panel-block {
  padding: 0.2em 0.5em;
}
</style>