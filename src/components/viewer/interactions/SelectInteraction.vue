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
<vl-interaction-select
  :ident="`select-target-${index}`"
  :filter="filterFunction"
  :features.sync="selectedFeatures"
  :toggle-condition="never"
  :remove-condition="shiftKeyOnly"
  @select="select"
  ref="interactionSelect"
>
  <vl-style-func :factory="styleFunctionFactory" />
</vl-interaction-select>
</template>

<script>
import {isCluster} from '@/utils/style-utils.js';
import {never, shiftKeyOnly} from 'ol/events/condition';

export default {
  name: 'select-interaction',
  props: {
    index: String
  },
  computed: {
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    selectedFeatures: {
      get() {
        return this.imageWrapper.selectedFeatures.selectedFeatures;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setSelectedFeatures', value);
      }
    },
    terms() {
      return this.imageWrapper.style.terms || [];
    },
    styleFunctionFactory() {
      this.imageWrapper.selectedFeatures.selectedFeatures;
      this.imageWrapper.style.layersOpacity;
      this.terms.forEach(term => {
        term.visible;
        term.opacity;
      });
      this.imageWrapper.style.displayNoTerm;
      this.imageWrapper.style.noTermOpacity;
      this.imageWrapper.draw.activeEditTool; // style is different in edit mode (vertices displayed)
      this.imageWrapper.properties.selectedPropertyValues;
      this.imageWrapper.properties.selectedPropertyColor;
      this.imageWrapper.review.reviewMode;

      return () => {
        return this.$store.getters[this.imageModule + 'genStyleFunction'];
      };
    },
    filterFunction() {
      return feature => !isCluster(feature);
    },
    never() {
      return never;
    },
    shiftKeyOnly() {
      return shiftKeyOnly;
    }
  },
  watch: {
    async styleFunctionFactory() {
      // HACK: style function is not called again when redefined => force the update of style for selected features
      if(this.$refs.interactionSelect && this.$refs.interactionSelect.$interaction) {
        await this.$refs.interactionSelect.$interaction.getFeatures().forEach(ft => ft.changed());
      }
    }
  },
  methods: {
    select({feature}) {
      let annot = feature.get('annot');
      annot.recordAction();
    }
  }
};
</script>
