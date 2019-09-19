<template>
<div class="box error" v-if="permissionError || notFoundError">
  <h2> {{ $t(permissionError ? 'access-denied' : 'not-found') }} </h2>
  <p> {{ $t(permissionError ? 'insufficient-permission' : 'not-found-error') }} </p>
</div>
<div class="content-wrapper" v-else>
  <b-loading :is-full-page="false" :active.sync="loading" />
  <div class="box" v-if="!loading">
    <i18n path="detailed-image-information" tag="h1">
      <router-link place="imageName" :to="`/project/${image.project}/image/${image.id}`">
        <image-name :image="image" />
      </router-link>
    </i18n>

    <image-details
      v-if="image"
      :image="image"
      @setResolution="resolution => setResolution(resolution)"
      @setMagnification="magnification => image.magnification = magnification"
      @delete="deleteImage()"
    />
  </div>
</div>
</template>

<script>
import ImageName from './ImageName';
import ImageDetails from './ImageDetails';

import {ImageInstance} from 'cytomine-client';
import vendorFromMime from '@/utils/vendor';

export default {
  name: 'image-information',
  components: {
    ImageName,
    ImageDetails
  },
  data() {
    return {
      loading: true,
      image: null,
      permissionError: false,
      notFoundError: false
    };
  },
  computed: {
    idImage() {
      return this.$route.params.idImage;
    }
  },
  watch: {
    idImage() {
      this.loadImage();
    }
  },
  methods: {
    async loadImage() {
      this.loading = true;
      this.permissionError = false;
      this.notFoundError = false;
      try {
        let image = await ImageInstance.fetch(this.idImage);
        image.vendor = vendorFromMime(image.mime);
        this.image = image;
      }
      catch(error) {
        console.log(error);
        if(error.response.status === 403) {
          this.permissionError = true;
        }
        else {
          this.notFoundError = true;
        }
      }
      this.loading = false;
    },
    deleteImage() {
      this.$router.push(`/project/${this.image.project}`);
    },
    setResolution(resolution) {
      this.image.physicalSizeX = resolution.x;
      this.image.physicalSizeY = resolution.y;
      this.image.physicalSizeZ = resolution.z;
      this.image.fps = resolution.t;
    }
  },
  created() {
    this.loadImage();
  }
};
</script>
