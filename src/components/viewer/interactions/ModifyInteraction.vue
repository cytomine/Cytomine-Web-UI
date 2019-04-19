<template>
<div>
  <vl-interaction-modify
    v-if="activeEditTool === 'modify'"
    ref="olModifyInteraction"
    :source="`select-target-${index}`"
    @modifystart="startEdit"
    @modifyend="endEdit"
  />

  <vl-interaction-translate
    v-if="activeEditTool === 'translate'"
    :source="`select-target-${index}`"
    @translatestart="startEdit"
    @translateend="endEdit"
  />

  <vl-interaction-rotate
    v-if="activeEditTool === 'rotate'"
    :source="`select-target-${index}`"
    @rotatestart="startEdit"
    @rotateend="endEdit"
  />
</div>
</template>

<script>
import WKT from 'ol/format/WKT';
import {Action} from '@/utils/annotation-utils.js';

export default {
  name: 'modify-interaction',
  props: {
    index: Number
  },
  data() {
    return {
      format: new WKT(),
    };
  },
  computed: {
    viewerModule() {
      return this.$store.getters.currentViewerModule;
    },
    imageWrapper() {
      return this.$store.getters.currentViewer.maps[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    activeEditTool() {
      return this.imageWrapper.activeEditTool;
    },
    ongoingEdit: {
      get() {
        return this.imageWrapper.activeEditTool;
      },
      set(value) {
        this.$store.commit(this.viewerModule + 'setOngoingEdit', {index: this.index, value});
      }
    },
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
          this.$store.commit(this.viewerModule + 'addAction', {
            index: this.index,
            annot,
            type: Action.UPDATE
          });
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
