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
<div class="color-manipulation">
  <h1>{{$t('colors')}}</h1>
  <table>
    <tr v-if="filters && filters.length > 0" class="has-border-bottom">
      <td>{{ $t('filter') }}</td>
      <td>
        <b-select v-model="selectedFilter" size="is-small">
          <option :value="null">{{$t('original-no-filter')}}</option>
          <option v-for="filter in filters" :key="filter.id" :value="filter.prefix">
            {{filter.name}}
          </option>
        </b-select>
      </td>
    </tr>
    <tr>
      <td>{{ $t('brightness') }}</td>
      <td>
        <cytomine-slider v-model="brightness" :min="-255" :max="255" />
      </td>
    </tr>
    <tr>
      <td>{{ $t('contrast') }}</td>
      <td>
        <cytomine-slider v-model="contrast" :min="-255" :max="255" />
      </td>
    </tr>
    <tr>
      <td>{{ $t('saturation') }}</td>
      <td>
        <cytomine-slider v-model="saturation" :min="-100" :max="100" />
      </td>
    </tr>
    <tr>
      <td>{{ $t('hue') }}</td>
      <td>
        <cytomine-slider v-model="hue" :min="-180" :max="180" />
      </td>
    </tr>
  </table>
  <div class="actions">
    <button class="button is-small" @click="reset()">{{$t('button-reset')}}</button>
  </div>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import CytomineSlider from '@/components/form/CytomineSlider';
import {ImageFilterProjectCollection} from 'cytomine-client';

export default {
  name: 'color-manipulation',
  components: {CytomineSlider},
  props: {
    index: String
  },
  data() {
    return {
      filters: null
    };
  },
  computed: {
    project: get('currentProject/project'),
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },

    selectedFilter: {
      get() {
        return this.imageWrapper.colors.filter;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setFilter', value);
      }
    },

    brightness: {
      get() {
        return this.imageWrapper.colors.brightness;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setBrightness', value);
      }
    },
    contrast: {
      get() {
        return this.imageWrapper.colors.contrast;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setContrast', value);
      }
    },
    hue: {
      get() {
        return this.imageWrapper.colors.hue;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setHue', value);
      }
    },
    saturation: {
      get() {
        return this.imageWrapper.colors.saturation;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setSaturation', value);
      }
    }
  },
  methods: {
    reset() {
      this.$store.commit(this.imageModule + 'resetColorManipulation');
    }
  },
  async created() {
    try {
      let filters = (await ImageFilterProjectCollection.fetchAll({filterKey: 'project', filterValue: this.project.id})).array;
      filters.forEach(filter => filter.prefix = filter.processingServer + filter.baseUrl);
      let prefixes = filters.map(filter => filter.prefix);
      if(this.selectedFilter && !prefixes.includes(this.selectedFilter)) {
        this.selectedFilter = null; // if selected filter no longer present in collection, unselect it
      }
      this.filters = filters;
    }
    catch(error) {
      console.log(error);
    }
  }
};
</script>

<style scoped>
td, tr {
  vertical-align: middle !important;
}

td:first-child {
  font-weight: 600;
  text-align: right;
  padding: 0.35em 0.5em;
}

td:last-child {
  width: 100%;
}

.actions {
  margin-top: 1em;
  text-align: right;
}

>>> .vue-slider {
  margin-left: 0.4em;
  margin-right: 4em;
}

.has-border-bottom td {
  padding-bottom: 1em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.has-border-bottom + tr td {
  padding-top: 1em;
}
</style>
