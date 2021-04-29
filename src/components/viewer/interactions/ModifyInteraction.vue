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
<div>
  <vl-interaction-modify
    v-if="activeEditTool === 'modify'"
    :source="selectSource"
    :delete-condition="deleteCondition"
    @modifystart="startEdit"
    @modifyend="endEdit"
  />

  <vl-interaction-translate
    v-if="activeEditTool === 'translate'"
    :source="selectSource"
    @translatestart="startEdit"
    @translateend="endEdit"
  />

  <vl-interaction-rotate
    v-if="activeEditTool === 'rotate'"
    :source="selectSource"
    @rotatestart="startEdit"
    @rotateend="endEdit"
  />
</div>
</template>

<script>
import WKT from 'ol/format/WKT';
import {Action} from '@/utils/annotation-utils.js';
import {singleClick} from 'ol/events/condition';

export default {
  name: 'modify-interaction',
  props: {
    index: String
  },
  data() {
    return {
      format: new WKT(),
    };
  },
  computed: {
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    selectSource() {
      return `select-target-${this.index}`;
    },
    activeEditTool() {
      return this.imageWrapper.draw.activeEditTool;
    },
    ongoingEdit: {
      get() {
        return this.imageWrapper.draw.ongoingEdit;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setOngoingEdit', value);
      }
    },
    deleteCondition() {
      return function(mapBrowserEvent) {
        return mapBrowserEvent.originalEvent.ctrlKey && singleClick(mapBrowserEvent);
      };
    }
  },
  methods: {
    startEdit() {
      this.ongoingEdit = true;
    },
    async endEdit({features}) {
      features.forEach(async feature => {
        if(!feature.get('annot')) {
          return;
        }

        let annot = feature.get('annot').clone();
        let oldLocation = annot.location;
        try {
          annot.location = this.format.writeFeature(feature);
          annot.terms = annot.term; // HACK for reviewed annotation (unconsistent behaviour)
          await annot.save();
          this.$eventBus.$emit('editAnnotation', annot);
          this.$store.commit(this.imageModule + 'addAction', {annot, type: Action.UPDATE});
        }
        catch(err) {
          console.log(err);
          this.$notify({type: 'error', text: this.$t('notif-error-annotation-update')});
          annot.location = oldLocation;
          feature.setGeometry(this.format.readGeometry(annot.location));
        }
      });
      this.ongoingEdit = false;
    },
  }
};
</script>
