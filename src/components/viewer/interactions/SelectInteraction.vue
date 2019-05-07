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
