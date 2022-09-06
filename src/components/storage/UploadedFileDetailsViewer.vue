<!-- Copyright (c) 2009-2022. Authors: see NOTICE file.

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
  <div v-if="!loading">
    <vl-map
      style="height: 500px"
      :data-projection="projectionName"
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
    >
      <vl-view
        :center.sync="center"
        :zoom.sync="zoom"
        :max-zoom="maxZoom"
        :max-resolution="maxResolution"
        :extent="extent"
        :projection="projectionName"
      />

      <vl-layer-tile :extent="extent" ref="baseLayer">
        <vl-source-zoomify
          :projection="projectionName"
          :urls="baseLayerURLs"
          :size="size"
          :extent="extent"
          crossOrigin="Anonymous"
          :transition="0"
        />
      </vl-layer-tile>
    </vl-map>
  </div>
</template>

<script>

import {addProj, createProj} from 'vuelayers/lib/ol-ext';
import {AbstractSliceCollection} from 'cytomine-client';

export default {
  name: 'uploaded-file-details-viewer',
  props: {
    image: Object
  },
  data() {
    return {
      slice: null,
      loading: true,
      baseLayerURLs: null,
      zoom: 2,
      maxZoom: 0,
      maxResolution: null,
      center: null,
      size: null,
      extent: null,
      projectionName: ''
    };
  },
  methods: {
    createProjection(imageId) {
      this.projectionName = 'CYTO-' + imageId;
      let projection = createProj({code: this.projectionName, units: 'pixels', extent: this.extent});
      addProj(projection);
    },
    setBaseLayerURLs() {
      let params = `&tileIndex={tileIndex}&z={z}&mimeType=${this.slice.mime}`;
      this.baseLayerURLs = [`${this.image.imageServerUrl}/slice/tile?fif=${this.slice.path}${params}`];
    },
    setImageSize(){
      this.size = [this.image.width, this.image.height];
      this.extent = [0, 0, this.image.width, this.image.height];
      this.center = [this.image.width/2, this.image.height/2];
    },

    async initViewVariables() {
      let slices = (await AbstractSliceCollection.fetchAll({filterKey: 'abstractimage', filterValue: this.image.id})).array;
      this.slice = slices[0];
      this.createProjection(this.image.id);

      this.maxZoom = this.image.zoom;
      this.maxResolution = Math.pow(2, this.image.zoom);

      this.setBaseLayerURLs();
      this.setImageSize();
    },
  },
  async created() {
    await this.initViewVariables();
    this.loading = false;
  }
};
</script>

<style scoped>
</style>
