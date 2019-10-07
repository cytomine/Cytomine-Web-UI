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
      editable
      @setResolution="resolution => image.resolution = resolution"
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
        this.image = await ImageInstance.fetch(this.idImage);
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
  },
  created() {
    this.loadImage();
  }
};
</script>
