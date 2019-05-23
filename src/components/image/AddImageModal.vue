<template>
<cytomine-modal :active="active" :title="$t('add-images')" @close="$emit('update:active', false)">
  <b-loading :is-full-page="false" :active="loading" class="small" />
  <template v-if="!loading">
    <b-message v-if="!images" type="is-danger" has-icon icon-size="is-small">
      <h2> {{ $t('error') }} </h2>
      <p> {{ $t('unexpected-error-info-message') }} </p>
    </b-message>
    <template v-else>
      <b-input class="search-images" v-model="searchString" :placeholder="$t('search-placeholder')"
      type="search" icon="search" />

      <b-table
        :data="filteredImages"
        class="table-images"
        :paginated="true"
        :per-page="perPage"
        pagination-size="is-small"
      >

        <template #default="{row: image}">
          <b-table-column :label="$t('overview')">
            <img :src="image.preview" class="image-overview">
          </b-table-column>

          <b-table-column field="originalFilename" :label="$t('name')" sortable>
            {{ image.originalFilename }}
          </b-table-column>

          <b-table-column field="created" :label="$t('created-on')" sortable>
            {{ Number(image.created) | moment('ll LT') }}
          </b-table-column>

          <b-table-column label=" " centered>
            <button v-if="wasAdded(image)" class="button is-small is-link" disabled>
              {{$t('button-added')}}
            </button>
            <span v-else-if="isInProject(image)">
              {{$t('already-in-project')}}
            </span>
            <button v-else class="button is-small is-link" @click="addImage(image)">
              {{$t('button-add')}}
            </button>
          </b-table-column>
        </template>

        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-image')}}</p>
          </div>
        </template>

        <template #bottom-left>
          <b-select v-model="perPage" size="is-small">
            <option value="10">10 {{$t('per-page')}}</option>
            <option value="25">25 {{$t('per-page')}}</option>
            <option value="50">50 {{$t('per-page')}}</option>
            <option value="100">100 {{$t('per-page')}}</option>
          </b-select>
        </template>

      </b-table>
    </template>
  </template>
</cytomine-modal>
</template>

<script>
// TODO: add endpoints in backend to allow backend pagination
import {get} from '@/utils/store-helpers';
import {AbstractImageCollection, ImageInstance} from 'cytomine-client';
import CytomineModal from '@/components/utils/CytomineModal';

export default {
  name: 'add-image-modal',
  props: {
    active: Boolean,
    idsImages: Array
  },
  components: {CytomineModal},
  data() {
    return {
      loading: true,
      images: null,
      perPage: 10,
      searchString: '',
      idsAddedImages: []
    };
  },
  computed: {
    project: get('currentProject/project'),
    filteredImages() {
      let filtered = this.images;

      if(this.searchString) {
        let str = this.searchString.toLowerCase();
        filtered = filtered.filter(image => {
          return image.originalFilename.toLowerCase().indexOf(str) >= 0;
        });
      }

      return filtered;
    }
  },
  watch: {
    active(val) {
      if(val) {
        this.idsAddedImages = [];
      }
    }
  },
  methods: {
    async addImage(abstractImage) {
      let propsTranslation = {imageName: abstractImage.originalFilename, projectName: this.project.name};
      try {
        let image = await new ImageInstance({baseImage: abstractImage.id, project: this.project.id}).save();
        this.idsAddedImages.push(abstractImage.id);
        this.$emit('addImage', image);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-add-image', propsTranslation)
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-add-image', propsTranslation)
        });
      }
    },
    isInProject(image) {
      return this.idsImages.includes(image.id);
    },
    wasAdded(image) {
      return this.idsAddedImages.includes(image.id);
    }
  },
  async created() {
    try {
      this.images = (await AbstractImageCollection.fetchAll()).array;
    }
    catch(error) {
      console.log(error);
    }
    this.loading = false;
  }
};
</script>

<style scoped>
>>> .animation-content {
  max-width: 60% !important;
  width: 60%;
}

>>> .modal-card {
  width: 100%;
  height: 80vh;
}

.image-overview {
  max-height: 4rem;
  max-width: 10rem;
}
</style>
