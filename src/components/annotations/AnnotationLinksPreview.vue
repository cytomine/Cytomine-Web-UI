<!-- Copyright (c) 2009-2019. Authors: see NOTICE file.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.-->

<template>
<div class="annotation-details">
  <template v-if="filteredLinks.length > 0">
    <div>
      <annotation-preview
          v-for="annotLink in filteredLinks"
          :key="`${annotation.id}-${annotLink.id}`"
          :annot="annotLink"
          :show-details="false"
          :show-image-info="false"
          :show-slice-info="false"
          :size="size"
          :color="(annotLink.id === annotation.id) ? mainColor : linkColor"
          :clickable="allowAnnotationSelection"
          :same-view-on-click="allowAnnotationSelection && showSelectAllButton"
          @select="selectAnnotation($event)"
      />
    </div>
    <a v-if="showSelectAllButton" class="button is-small is-fullwidth" @click="showLinkedAnnotations()">
      {{ $t('button-show-linked-annots') }}
    </a>
  </template>
  <em v-else>{{$t('no-linked-annotation')}}</em>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import ImageName from '@/components/image/ImageName';

import AnnotationPreview from '@/components/annotations/AnnotationPreview';
import constants from '@/utils/constants';

export default {
  name: 'annotations-details',
  components: {
    'annotation-preview': AnnotationPreview,
    ImageName,
  },
  props: {
    annotation: {type: Object},
    images: {type: Array},
    allowAnnotationSelection: {type: Boolean, default: false},
    showSelectAllButton: {type: Boolean, default: false},
    showMainAnnotation: {type: Boolean, default: false},
    size: {type: Number, default: 64},
    mainColor: {type: String, default: null},
    linkColor: {type: String, default: null},
  },
  data() {
    return {};
  },
  computed: {
    configUI: get('currentProject/configUI'),
    currentUser: get('currentUser/user'),

    image() {
      return this.images.find(image => image.id === this.annotation.image) ||
        {'id': this.annotation.image, 'instanceFilename': this.annotation.instanceFilename};
    },

    annotationURL() {
      return `/project/${this.annotation.project}/image/${this.annotation.image}/annotation/${this.annotation.id}`;
    },

    annotationLinks() {
      if (!this.annotation.annotationLink || this.annotation.annotationLink.length < 2) {
        return [];
      }

      return this.annotation.annotationLink.filter(link => link.annotation !== this.annotation.id).map(link => {
        return {
          id: link.annotation,
          image: link.image,
          url: `${constants.CYTOMINE_CORE_HOST}/api/annotation/${link.annotation}/crop.png`
        };
      });
    },
    filteredLinks() {
      if (this.showMainAnnotation) {
        return [this.annotation, ...this.annotationLinks];
      }
      return this.annotationLinks;
    }
  },
  methods: {
    showLinkedAnnotations() {
      this.annotationLinks.forEach( link => {
        this.$emit('select', {annot: link, options:{}});
      });
    },
    selectAnnotation({annot, options}) {
      if (this.allowAnnotationSelection) {
        this.$emit('select', {annot, options});
      }
    }
  },
};
</script>

<style scoped>
>>> .annot-preview {
  margin: 3px;
}
</style>
