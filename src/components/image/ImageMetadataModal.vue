<!-- Copyright (c) 2009-2021. Authors: see NOTICE file.

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
<cytomine-modal :active="active" :title="$t('image-metadata')" @close="$emit('update:active', false)">
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
    <h2> {{ $t('error') }} </h2>
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>
  <template v-else>
    <template v-if="image && image.macroURL">
      <p :style="styleImagePreview" class="image-preview">
        <img :class="'rotate-' + rotationAngle" :src="image.macroURL" ref="image">
      </p>
      <div class="buttons is-centered are-small">
        <button class="button" @click="rotate(-90)"><i class="fas fa-undo"></i></button>
        <button class="button" @click="rotate(90)"><i class="fas fa-undo mirror"></i></button>
      </div>
    </template>

    <b-input
      v-model="searchString"
      :placeholder="$t('search-placeholder')"
      type="search"
      icon="search"
      size="is-small"
    />
    <ul>
      <li v-for="prop in filteredProps" :key="prop.id">
        <strong>{{prop.key}}</strong>: {{prop.value}}
      </li>
    </ul>
  </template>

  <template #footer>
    <button class="button" type="button" @click="$emit('update:active', false)">
      {{$t('button-close')}}
    </button>
  </template>
</cytomine-modal>
</template>

<script>
import {AbstractImage, PropertyCollection} from 'cytomine-client';
import CytomineModal from '@/components/utils/CytomineModal';
import {getWildcardRegexp} from '@/utils/string-utils';

export default {
  name: 'image-metadata-modal',
  props: {
    active: Boolean,
    image: Object
  },
  components: {CytomineModal},
  data() {
    return {
      error: false,
      properties: [],
      searchString: '',
      rotationAngle: 0
    };
  },
  computed: {
    filteredProps() {
      if(!this.searchString) {
        return this.properties;
      }
      let regexp = getWildcardRegexp(this.searchString);
      return this.properties.filter(prop => regexp.test(prop.key) || regexp.test(prop.value));
    },
    styleImagePreview() {
      this.rotationAngle; // to force re-evaluation each time rotationAngle changes
      if(!this.$refs.image) {
        return;
      }

      let reverse = (this.rotationAngle === 90 || this.rotationAngle === 270);
      let width = this.$refs.image.clientWidth + 'px';
      let height = this.$refs.image.clientHeight + 'px';
      return {
        width: reverse ? height : width,
        height: reverse ? width : height
      };
    }
  },
  methods: {
    async rotate(val) {
      this.rotationAngle = (this.rotationAngle + val + 360) % 360;
    }
  },
  async created() {
    try {
      let abstractImage = new AbstractImage({id: this.image.baseImage, class: 'be.cytomine.image.AbstractImage'});
      this.properties = (await PropertyCollection.fetchAll({object: abstractImage})).array;
      this.properties.sort((a, b) => a.key.localeCompare(b.key));
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .modal-card, /deep/ .modal-card-body {
  width: 800px;
  max-width: 100%;
}

.image-preview {
  margin: auto;
  overflow: hidden;
  margin-bottom: 0.5em;
  text-align: center;
}

img {
  transform-origin: top left;
  max-width: initial;

  &.rotate-90 {
    transform: rotate(90deg) translateY(-100%);
  }

  &.rotate-180 {
    transform: rotate(180deg) translate(-100%,-100%);
  }

  &.rotate-270 {
    transform: rotate(270deg) translateX(-100%);
  }
}

.mirror {
  transform: scale(-1, 1);
}

input {
  max-width: 30em;
  margin-bottom: 1em;
}

li {
  overflow-wrap: break-word;
}
</style>
