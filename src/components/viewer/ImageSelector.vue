<template>
<div>
  <div class="image-selector-wrapper" v-show="imageSelectorEnabled">
    <b-loading :is-full-page="false" :active="loading" />
    <template v-if="!loading">
      <div class="header">
        <b-input class="search-images" v-model="searchString" :placeholder="$t('search-placeholder')"
          type="search" icon="search"
        />
        <button class="delete" @click="imageSelectorEnabled = false"></button>
      </div>
      <div class="content-wrapper" v-if="error">
        <b-message type="is-danger" has-icon icon-size="is-small">
          <h2> {{ $t('error') }} </h2>
          <p> {{ $t('unexpected-error-info-message') }} </p>
        </b-message>
      </div>
      <div v-else class="image-selector">
        <div class="card" v-for="image in displayedImages" :key="image.id">
          <a class="card-image" @click="addMap(image)" :style="'background-image: url(' + image.preview + ')'"></a>
          <div class="card-content">
            <div class="content">
              <a @click="addMap(image)">
                <image-name :image="image" />
              </a>
            </div>
          </div>
        </div>

        <button class="button" v-if="nbImagesDisplayed < filteredImages.length" @click="more()">
          {{$t('button-more')}}
        </button>

        <div class="space">&nbsp;</div>
      </div>
    </template>
  </div>

  <a
    class="image-selector-button"
    @click="imageSelectorEnabled = true"
    v-tooltip="{content: $t('add-image'), placement: 'left'}"
  >
    <i class="fas fa-plus"></i>
  </a>
</div>
</template>

<script>
import ImageName from '@/components/image/ImageName';
import {ImageInstanceCollection} from 'cytomine-client';

export default {
  name: 'image-selector',
  components: {ImageName},
  props: {
    idViewer: String
  },
  data() {
    return {
      images: [],
      searchString: '',
      nbImagesDisplayed: 20,
      loading: true,
      error: false
    };
  },
  computed: {
    project() {
      return this.$store.state.project.project;
    },
    imageSelectorEnabled: {
      get() {
        return this.$store.state.images.viewers[this.idViewer].imageSelector;
      },
      set(value) {
        this.$store.commit('setImageSelector', {idViewer: this.idViewer, value});
      }
    },
    filteredImages() { // TODO: in backend
      let filtered = this.images;

      if(this.searchString) {
        let str = this.searchString.toLowerCase();
        filtered =  filtered.filter(image => {
          return image.instanceFilename.toLowerCase().indexOf(str) >= 0;
        });
      }

      return filtered;
    },
    displayedImages() {
      return this.filteredImages.slice(0, this.nbImagesDisplayed);
    }
  },
  methods: {
    async addMap(image) {
      try {
        await this.$store.dispatch('addMap', {idViewer: this.idViewer, image});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-add-viewer-image')});
      }
    },

    more() {
      this.nbImagesDisplayed += 20;
    }
  },
  async created() {
    try {
      this.images = (await ImageInstanceCollection.fetchAll({
        filterKey: 'project',
        filterValue: this.project.id
      })).array; // TODO: should not load full array, should be done with backend
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }
    this.loading = false;
  }
};
</script>

<style scoped>
.image-selector-wrapper {
  position: absolute;
  left: 0px;
  bottom: 0px;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  width: 100%;
  height: 270px;
  z-index: 150;
}

.header {
  padding: 10px 10px 0px 10px;
  display: flex;
  justify-content: space-between;
}

.image-selector {
  width: 100%;
  overflow: auto;
  display: flex;
  align-items: center;
  flex: 1;
}

.card {
  display: inline-block;
  min-width: 160px;
  flex: 0;
  box-sizing: border-box;
  margin: 10px;
}

.card-image {
  display: inline-block;
  width: 100%;
  height: 120px;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: white;
  border-bottom: 1px solid #ddd;
}

.card-content {
  padding: 10px;
  font-size: 12px;
  overflow-wrap: break-word;
  overflow: hidden;
  height: 60px;
}

.space {
  margin-left: 5px;
}

.image-selector-button {
  background: #95b5db;
  border: 4px solid white;
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 48px;
  height: 48px;
  border-radius: 25px;
  text-align: center;
  line-height: 40px;
  color: white;
  font-size: 22px;
  box-sizing: border-box;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  z-index: 100;
}
</style>
