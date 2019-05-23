<template>
<div>
  <vl-interaction-modify
    v-if="activeEditTool === 'modify'"
    :source="selectSource"
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
