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
<b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
  <h2> {{ $t('error') }} </h2>
  <p> {{ $t('unexpected-error-info-message') }} </p>
</b-message>
<table class="table custom-ui" v-else-if="!loading">
  <tbody v-for="category in customUITree" :key="category.label">
    <tr>
      <th colspan="3">{{$t(category.label)}}</th>
    </tr>
    <tr v-for="prop in category.props" :key="prop.key">
      <td>
        <i v-if="prop.superscript" class="superscript" :class="prop.superscript"></i>
        <span class="icon" v-if="prop.icon || prop.iconComponent">
          <i v-if="prop.icon" :class="prop.icon"></i>
          <component v-else :is="prop.iconComponent" />
        </span>
        {{$t(prop.label)}}
      </td>
      <td>
        <button
          :class="['button', customUI[prop.key].ADMIN_PROJECT ? 'is-success' : 'is-danger']"
          @click="toggleProp(prop.key, 'ADMIN_PROJECT')"
          :disabled="prop.key === 'project-configuration-tab'"
        >
          {{$t('manager')}}
        </button>
      </td>
      <td>
        <button
          :class="['button', customUI[prop.key].CONTRIBUTOR_PROJECT ? 'is-success' : 'is-danger']"
          @click="toggleProp(prop.key, 'CONTRIBUTOR_PROJECT')"
          :disabled="prop.key === 'project-configuration-tab'"
        >
            {{$t('contributor')}}
        </button>
      </td>
    </tr>
  </tbody>
</table>
</template>

<script>
import {get} from '@/utils/store-helpers';

import IconPolygonFreeHand from '@/components/icons/IconPolygonFreeHand';
import IconLineFreeHand from '@/components/icons/IconLineFreeHand';

export default {
  name: 'custom-ui-project',
  data() {
    return {
      loading: true,
      error: false,

      customUI: {},
      customUITree: [
        {
          label: 'project-side-bar',
          props: [
            {key: 'project-images-tab', label: 'images', icon: 'far fa-images'},
            {key: 'project-annotations-tab', label: 'annotations', icon: 'far fa-edit'},
            {key: 'project-jobs-tab', label: 'analysis', icon: 'fas fa-tasks'},
            {key: 'project-activities-tab', label: 'activity', icon: 'fas fa-tachometer-alt'},
            {key: 'project-information-tab', label: 'information', icon: 'fas fa-info-circle'},
            {key: 'project-configuration-tab', label: 'configuration', icon: 'fas fa-cogs'}
          ]
        },
        {
          label: 'viewer-panels',
          props: [
            {key: 'project-explore-hide-tools', label: 'all-panels'}, // hide all panels
            {key: 'project-explore-overview', label: 'overview', icon: 'fas fa-image'},
            {key: 'project-explore-info', label: 'information', icon: 'fas fa-info'},
            {key: 'project-explore-digital-zoom', label: 'digital-zoom', icon: 'fas fa-search'},
            {key: 'project-explore-link', label: 'link-images', icon: 'fas fa-link'},
            {key: 'project-explore-color-manipulation', label: 'colors', icon: 'fas fa-adjust'},
            {key: 'project-explore-image-layers', label: 'annotation-layers', icon: 'fas fa-copy'},
            {key: 'project-explore-ontology', label: 'ontology', icon: 'fas fa-hashtag'},
            {key: 'project-explore-property', label: 'properties', icon: 'fas fa-tag'},
            {key: 'project-explore-follow', label: 'broadcast', icon: 'fas fa-street-view'},
            {key: 'project-explore-review', label: 'review', icon: 'fas fa-check-circle'},
          ]
        },
        {
          label: 'annotation-details',
          props: [
            // display annotation details in viewer
            {key: 'project-explore-annotation-main', label: 'annotation-details-box'},
            {key: 'project-explore-annotation-geometry-info', label: 'geometry-info',
              icon: 'fas fa-ruler-combined'},
            {key: 'project-explore-annotation-description', label: 'description', icon: 'far fa-file-alt'},
            {key: 'project-explore-annotation-terms', label: 'terms', icon: 'fas fa-hashtag'},
            {key: 'project-explore-annotation-properties', label: 'properties', icon: 'fas fa-tag'},
            {key: 'project-explore-annotation-attached-files', label: 'attached-files', icon: 'fas fa-paperclip'},
            {key: 'project-explore-annotation-creation-info', label: 'creation-info', icon: 'fas fa-info'},
            {key: 'project-explore-annotation-comments', label: 'comments', icon: 'fas fa-comment'}

          ]
        },
        {
          label: 'draw-tools',
          props: [
            {key: 'project-tools-main', label: 'all-draw-tools'},

            {key: 'project-tools-select', label: 'select', icon: 'fas fa-mouse-pointer'},

            {key: 'project-tools-point', label: 'point', icon: 'fas fa-map-marker-alt'},
            {key: 'project-tools-line', label: 'line', icon: 'fas fa-minus'},
            {key: 'project-tools-freehand-line', label: 'freehand-line',
              iconComponent: IconLineFreeHand},
            {key: 'project-tools-rectangle', label: 'rectangle', icon: 'far fa-square'},
            {key: 'project-tools-circle', label: 'circle', icon: 'far fa-circle'},
            {key: 'project-tools-polygon', label: 'polygon', icon: 'fas fa-draw-polygon'},
            {key: 'project-tools-freehand-polygon', label: 'freehand-polygon',
              iconComponent: IconPolygonFreeHand},
            {key: 'project-tools-union', label: 'freehand-correct-add', icon: 'fas fa-pencil-alt',
              superscript: 'fas fa-plus'},
            {key: 'project-tools-diff', label: 'freehand-correct-remove', icon: 'fas fa-pencil-alt',
              superscript: 'fas fa-minus'},

            {key: 'project-tools-fill', label: 'fill', icon: 'fas fa-fill',},
            {key: 'project-tools-edit', label: 'modify', icon: 'fas fa-edit'},
            {key: 'project-tools-move', label: 'move', icon: 'fas fa-arrows-alt'},
            {key: 'project-tools-rotate', label: 'rotate', icon: 'fas fa-sync-alt'},
            {key: 'project-tools-delete', label: 'delete', icon: 'fas fa-trash-alt'},

            {key: 'project-tools-undo-redo', label: 'undo-redo', icon: 'fas fa-undo'},
          ]
        }
      ]
    };
  },
  computed: {
    project: get('currentProject/project')
  },
  methods: {
    async toggleProp(prop, userType) {
      try {
        this.customUI[prop][userType] = !this.customUI[prop][userType];
        this.customUI = await this.project.saveUIConfig(this.customUI);
        this.$store.dispatch('currentProject/fetchUIConfig');
      }
      catch(error) {
        console.log(error);
        this.customUI[prop][userType] = !this.customUI[prop][userType]; // revert change
        this.$notify({type: 'error', text: this.$t('notif-error-custom-ui-change')});
      }
    }
  },
  async created() {
    try {
      this.customUI = await this.project.fetchUIConfig();
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
.button {
  padding: 0 3em;
}

td, th {
  vertical-align: middle !important;
}

.icon {
  width: 20px;
  text-align: center;
  margin-right: 1em;
}

.superscript {
  position: relative;
  font-size: 0.7em;
  width: 0;
  bottom: 0.75em;
  right: 4px;
  margin-right: 0;
}
</style>

<style>
.custom-ui .icon svg {
  height: 1.15em !important;
}
</style>
