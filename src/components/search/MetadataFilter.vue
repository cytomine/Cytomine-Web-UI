<template>
  <div class="metadata-filter">
    <h2>{{ format }}</h2>
    <div class="columns is-multiline">
      <div class="column is-narrow" v-for="(value, key) in filters" :key="key">
        <div class="box">
          <div class="filter"><strong class="key">{{ key }}</strong>: {{ value }}</div>
          <button class="delete" @click="removeFilter(key)"/>
        </div>
      </div>
    </div>

    <div class="search-block" v-if="filteredKeys">
      <b-dropdown v-model="currentKey" :placeholder="$t('search-placeholder')" scrollable>
        <template #trigger>
          <b-button class="crop" :label="currentKey" type="is-primary"/>
        </template>

        <b-dropdown-item custom>
          <b-input
            v-model="searchKey"
            :placeholder="$t('search-placeholder')"
            icon="search"
            type="search"
          />
        </b-dropdown-item>

        <b-dropdown-item v-for="key in filteredKeys" :key="key" :value="key">
          {{ key }}
        </b-dropdown-item>
      </b-dropdown>

      <div class="metadata" v-if="type[currentKey] === Number">
        <div class="metadata-slider">
          <cytomine-slider v-model="sliderValue" :max="Number(max[currentKey])"/>
        </div>
      </div>

      <div v-else-if="type[currentKey] === Date">
        <b-datetimepicker
          class="search-images"
          v-model="searchValue"
          :first-day-of-week="1"
          icon="calendar"
          placeholder="Click to select..."
        >
          <template #left>
            <b-button
              label="Now"
              type="is-primary"
              icon-left="clock"
              @click="searchValue = new Date()"
            />
          </template>

          <template #right>
            <b-button
              label="Clear"
              type="is-danger"
              icon-left="times-circle"
              outlined
              @click="searchValue = null"
            />
          </template>
        </b-datetimepicker>
      </div>

      <b-autocomplete
        class="search-images"
        v-else
        v-model="searchValue"
        :data="searchChoices"
        :disabled="currentKey === 'Select metadata'"
        :open-on-focus="true"
        :placeholder="$t('search-placeholder')"
        icon="search"
        type="search"
        clearable
      />

      <b-button
        @click="searchImage"
        :disabled="(searchValue === '') && (type[currentKey] === String)"
      >
        {{ $t('button-add') }}
      </b-button>
    </div>
  </div>
</template>

<script>
import {Cytomine} from 'cytomine-client';

import CytomineSlider from '@/components/form/CytomineSlider.vue';
import {filterAutoCompletion} from '@/utils/metadata.js';

export default {
  name: 'metadata-filter',
  components: {
    CytomineSlider,
  },
  props: {
    format: {type: String, default: ''},
    imageIds: {type: Array, default: () => []},
    keys: {type: Array, default: () => []},
    max: {type: Object, default: () => {}},
    type: {type: Object, default: () => {}},
  },
  data() {
    return {
      currentKey: 'Select metadata',
      currentValue: '',
      searchChoices: [],
      searchKey: '',
      searchValue: '',
      sliderValues: {},
    };
  },
  computed: {
    searchModule() {
      return this.$store.getters['currentProject/currentMetadataSearch'];
    },
    filters: {
      get() {
        if (this.format in this.searchModule) {
          return this.searchModule[this.format];
        }

        return {};
      },
      set(value) {
        this.currentValue = value;
        this.$store.commit(
          'currentProject/setCurrentMetadataSearch',
          {format: this.format, key: this.currentKey, searchValue: value},
        );
      }
    },
    sliderValue: {
      get() {
        return this.sliderValues[this.currentKey];
      },
      set(value) {
        this.$set(this.sliderValues, this.currentKey, value);
        this.searchValue = this.sliderValues[this.currentKey];
      }
    },
    filteredKeys() {
      return this.keys.filter((item) => item.toLowerCase().indexOf(this.searchKey.toLowerCase()) >= 0);
    },
  },
  methods: {
    async fetchAutoCompletion() {
      return (await Cytomine.instance.api.get(
        'search/autocomplete.json',
        {params: {key: this.currentKey, searchTerm: encodeURI(this.searchValue)}}
      )).data['collection'];
    },
    async removeFilter(key) {
      this.$store.commit(
        'currentProject/removeMetadataFilter',
        {format: this.format, key},
      );

      await this.searchImage();
      this.$forceUpdate();
    },
    async searchImage() {
      if (this.searchValue) {
        this.filters = this.searchValue;
        this.searchValue = '';
      }

      let filteredImageIds = this.imageIds;
      if (Object.keys(this.filters).length) {
        let data = {
          'filters': this.filters,
          'imageIds': this.imageIds,
        };

        filteredImageIds = (await Cytomine.instance.api.post('search.json', data)).data['collection'];
      }

      this.$eventBus.$emit('includeImageIDs', this.format, filteredImageIds);
    }
  },
  watch: {
    keys() {
      this.keys.forEach(key => this.sliderValues[key] = [0, Number(this.max[key])]);
    },
    async currentKey() {
      if (this.type[this.currentKey] === Number) {
        this.searchValue = this.sliderValues[this.currentKey];
      }
      else {
        this.searchValue = '';
        this.searchChoices = await this.fetchAutoCompletion();
      }
    },
    async searchValue() {
      if (this.type[this.currentKey] !== String) {
        return;
      }

      this.searchChoices = await this.fetchAutoCompletion();

      if (this.currentKey.endsWith('alias') || this.currentKey.endsWith('id')) {
        this.searchChoices = filterAutoCompletion(
          this.currentKey,
          this.searchChoices
        );
      }
    }
  },
  created() {
    this.$store.commit('currentProject/setImageFormat', this.format);

    this.keys.forEach(key => this.sliderValues[key] = [0, Number(this.max[key])]);
  }
};
</script>

<style scoped>
.box {
  align-items: center;
  display: flex;
  justify-content: space-between;
  max-width: 750px;
  white-space: initial;
  word-break: break-word;
}

.crop {
  height: auto;
  white-space: initial;
  word-break: break-word;
}

.delete {
  float: right;
}

.filter {
  display: flex;
  margin-right: 10px;
}

.key {
  max-width: 75%;
}

.metadata {
  width: 300px;
}

.metadata-filter {
  margin: 10px;
}

.metadata-slider {
  flex-grow: 3;
}

.search-block {
  display: flex;
}

>>> .search-images {
  display: flex;
  max-width: 30rem;
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
