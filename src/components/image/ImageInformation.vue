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
