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
<div class="draw-tools-wrapper">
  <div class="buttons has-addons are-small" v-if="isToolDisplayed('select')">
    <button
      v-tooltip="$t('select')"
      class="button"
      :class="{'is-selected': activeTool === 'select'}"
      @click="activateTool('select')"
    >
      <span class="icon is-small"><i class="fas fa-mouse-pointer"></i></span>
    </button>
  </div>

  <template v-if="!reviewMode"> <!-- drawing new annotations forbidden while reviewing -->
    <div
      v-if="terms && terms.length > 0"
      class="buttons has-addons are-small term-selection"
      :class="{'has-preview': termsToAssociate.length > 0}"
      v-click-outside="() => showTermSelector = false"
    >
      <button
        v-tooltip="$t('terms-new-annotation')"
        class="button"
        :disabled="disabledDraw"
        @click="showTermSelector = !showTermSelector"
      >
        <span class="icon is-small"><i class="fas fa-hashtag"></i></span>
      </button>

      <div class="color-preview" :style="{background: backgroundTermsNewAnnot}">
        <span v-if="termsToAssociate.length > 1">{{termsToAssociate.length}}</span>
      </div>

      <div class="ontology-tree-container" v-show="showTermSelector">
        <b-input v-model="searchStringTerm" :placeholder="$t('search-placeholder')" size="is-small" />
        <ontology-tree
          class="ontology-tree"
          v-model="termsToAssociate"
          :ontology="ontology"
          :searchString="searchStringTerm"
        />
      </div>
    </div>

    <div class="buttons has-addons are-small">
      <button
        v-if="isToolDisplayed('point')"
        :disabled="disabledDraw"
        v-tooltip="$t('point')"
        class="button"
        :class="{'is-selected': activeTool === 'point'}"
        @click="activateTool('point')"
      >
        <span class="icon is-small"><i class="fas fa-map-marker-alt"></i></span>
      </button>

      <button
        v-if="isToolDisplayed('line')"
        :disabled="disabledDraw"
        v-tooltip="$t('line')"
        class="button"
        :class="{'is-selected': activeTool === 'line'}"
        @click="activateTool('line')"
      >
        <span class="icon is-small"><i class="fas fa-minus"></i></span>
      </button>

      <button
        v-if="isToolDisplayed('freehand-line')"
        :disabled="disabledDraw"
        v-tooltip="$t('freehand-line')"
        class="button"
        :class="{'is-selected': activeTool === 'freehand-line'}"
        @click="activateTool('freehand-line')"
      >
        <span class="icon is-small">
          <icon-line-free-hand />
        </span>
      </button>

      <!-- QUESTION: redefine expected behaviour
      <button class="button" :disabled="disabledDraw" title="Arrow"
              @click="activateTool('arrow')" :class="{'is-selected': activeTool === 'arrow'}">
          <span class="icon is-small"><i class="fas fa-long-arrow-right"></i></span>
      </button> -->

      <button
        v-if="isToolDisplayed('rectangle')"
        :disabled="disabledDraw"
        v-tooltip="$t('rectangle')"
        class="button"
        :class="{'is-selected': activeTool === 'rectangle'}"
        @click="activateTool('rectangle')"
      >
        <span class="icon is-small"><i class="far fa-square"></i></span>
      </button>

      <button
        v-if="isToolDisplayed('circle')"
        :disabled="disabledDraw"
        v-tooltip="$t('circle')"
        class="button"
        :class="{'is-selected': activeTool === 'circle'}"
        @click="activateTool('circle')"
      >
        <span class="icon is-small"><i class="far fa-circle"></i></span>
      </button>

      <button
        v-if="isToolDisplayed('polygon')"
        :disabled="disabledDraw"
        v-tooltip="$t('polygon')"
        class="button"
        :class="{'is-selected': activeTool === 'polygon'}"
        @click="activateTool('polygon')"
      >
        <span class="icon is-small"><i class="fas fa-draw-polygon"></i></span>
      </button>

      <button
        v-if="isToolDisplayed('freehand-polygon')"
        :disabled="disabledDraw"
        v-tooltip="$t('freehand-polygon')"
        class="button"
        :class="{'is-selected': activeTool === 'freehand-polygon'}"
        @click="activateTool('freehand-polygon')"
      >
        <span class="icon is-small">
          <icon-polygon-free-hand />
        </span>
      </button>
    </div>
  </template>

  <template v-else>
    <div class="buttons has-addons are-small">
      <button
        :disabled="isToolDisabled('accept')"
        v-tooltip="$t('validate-annotation')"
        class="button"
        :class="{'is-success': !isToolDisabled('accept')}"
        @click="accept()"
      >
      <span class="icon is-small"><i class="fas fa-check"></i></span>
    </button>
    <button
        :disabled="isToolDisabled('reject')"
        v-tooltip="$t('reject-annotation')"
        class="button"
        :class="{'is-danger': !isToolDisabled('reject')}"
        @click="reject()"
      >
      <span class="icon is-small"><i class="fas fa-minus"></i></span>
    </button>
    </div>
  </template>

  <div v-if="configUI['project-explore-annotation-main']" class="buttons has-addons are-small">
    <button
      :disabled="!selectedFeature"
      v-tooltip="$t('display-annot-details')"
      class="button" :class="{'is-selected': displayAnnotDetails && selectedFeature}"
      @click="displayAnnotDetails = !displayAnnotDetails"
    >
      <span class="icon is-small"><i class="fas fa-info"></i></span>
    </button>
  </div>

  <div class="buttons has-addons are-small">
    <button
      v-if="isToolDisplayed('fill')"
      :disabled="isToolDisabled('fill')"
      v-tooltip="$t('fill')"
      class="button"
      @click="fill()"
    >
      <span class="icon is-small"><i class="fas fa-fill"></i></span>
    </button>

    <button
      v-if="isToolDisplayed('edit')"
      :disabled="isToolDisabled('edit')"
      v-tooltip="$t('modify')"
      class="button"
      :class="{'is-selected': activeEditTool === 'modify'}"
      @click="activateEditTool('modify')"
    >
      <span class="icon is-small"><i class="fas fa-edit"></i></span>
    </button>

    <button
      v-if="isToolDisplayed('union')"
      :disabled="isToolDisabled('correct-add')"
      v-tooltip="$t('freehand-correct-add')"
      class="button"
      :class="{'is-selected': activeEditTool === 'correct-add'}"
      @click="activateEditTool('correct-add')"
    >
      <span class="icon is-small"><i class="superscript fas fa-plus"></i><i class="fas fa-pencil-alt"></i></span>
    </button>

    <button
      v-if="isToolDisplayed('diff')"
      :disabled="isToolDisabled('correct-remove')"
      v-tooltip="$t('freehand-correct-remove')"
      class="button"
      :class="{'is-selected': activeEditTool === 'correct-remove'}"
      @click="activateEditTool('correct-remove')"
    >
      <span class="icon is-small"><i class="superscript fas fa-minus"></i><i class="fas fa-pencil-alt"></i></span>
    </button>

    <button
      v-if="isToolDisplayed('move')"
      :disabled="isToolDisabled('move')"
      v-tooltip="$t('move')"
      class="button"
      :class="{'is-selected': activeEditTool === 'translate'}"
      @click="activateEditTool('translate')"
    >
      <span class="icon is-small"><i class="fas fa-arrows-alt"></i></span>
    </button>

    <button
      v-if="isToolDisplayed('rotate')"
      :disabled="isToolDisabled('rotate')"
      v-tooltip="$t('rotate')"
      class="button"
      :class="{'is-selected': activeEditTool === 'rotate'}"
      @click="activateEditTool('rotate')"
    >
      <span class="icon is-small"><i class="fas fa-sync-alt"></i></span>
    </button>

    <button
      v-if="isToolDisplayed('delete')"
      :disabled="isToolDisabled('delete')"
      v-tooltip="$t('delete')"
      class="button"
      @click="confirmDeletion()"
    >
      <span class="icon is-small"><i class="far fa-trash-alt"></i></span>
    </button>
  </div>

  <div v-if="isToolDisplayed('undo-redo')" class="buttons has-addons are-small">
    <button
      :disabled="actions.length === 0"
      v-tooltip="$t('undo')"
      class="button"
      @click="undo()"
    >
      <span class="icon is-small"><i class="fas fa-undo"></i></span>
    </button>

    <button
      :disabled="undoneActions.length === 0"
      v-tooltip="$t('redo')"
      class="button"
      @click="redo()"
    >
      <span class="icon is-small"><i class="fas fa-redo"></i></span>
    </button>
  </div>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import OntologyTree from '@/components/ontology/OntologyTree';
import IconPolygonFreeHand from '@/components/icons/IconPolygonFreeHand';
import IconLineFreeHand from '@/components/icons/IconLineFreeHand';

import WKT from 'ol/format/WKT';

import {Cytomine, Annotation, AnnotationType} from 'cytomine-client';
import {Action, updateTermProperties} from '@/utils/annotation-utils.js';

export default {
  name: 'draw-tools',
  components: {
    OntologyTree,
    IconPolygonFreeHand,
    IconLineFreeHand
  },
  props: {
    index: String
  },
  data() {
    return {
      showTermSelector: false,
      format: new WKT(),
      searchStringTerm: ''
    };
  },
  computed: {
    configUI: get('currentProject/configUI'),
    ontology: get('currentProject/ontology'),

    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    viewerWrapper() {
      return this.$store.getters['currentProject/currentViewer'];
    },
    imageWrapper() {
      return this.viewerWrapper.images[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    terms() {
      return this.$store.getters['currentProject/terms'];
    },
    termsToAssociate: {
      get() {
        return this.imageWrapper.draw.termsNewAnnots;
      },
      set(terms) {
        this.$store.commit(this.imageModule + 'setTermsNewAnnots', terms);
      }
    },
    backgroundTermsNewAnnot() {
      if(this.termsToAssociate.length === 1) {
        return this.terms.find(term => this.termsToAssociate[0] === term.id).color;
      }
      else {
        return '#e2e2e2';
      }
    },
    activeTool: {
      get() {
        return this.imageWrapper.draw.activeTool;
      },
      set(tool) {
        this.$store.dispatch(this.imageModule + 'activateTool', tool);
      }
    },
    displayAnnotDetails: {
      get() {
        return this.imageWrapper.selectedFeatures.displayAnnotDetails;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setDisplayAnnotDetails', value);
      }
    },
    activeEditTool: {
      get() {
        return this.imageWrapper.draw.activeEditTool;
      },
      set(tool) {
        this.$store.commit(this.imageModule + 'activateEditTool', tool);
      }
    },
    selectedFeature() {
      return this.$store.getters[this.imageModule + 'selectedFeature'];
    },
    layers() {
      return this.imageWrapper.layers.selectedLayers || [];
    },
    noActiveLayer() {
      return !this.layers.find(layer => layer.drawOn);
    },
    disabledDraw() {
      return this.noActiveLayer;
    },
    actions() {
      return this.imageWrapper.undoRedo.actions;
    },
    undoneActions() {
      return this.imageWrapper.undoRedo.undoneActions;
    },
    isActiveImage() {
      return this.viewerWrapper.activeImage === this.index;
    },
    reviewMode() {
      return this.imageWrapper.review.reviewMode;
    }
  },
  watch: {
    noActiveLayer(value) {
      if(value) {
        this.activeTool = 'select';
      }
    },
    selectedFeature(feature) {
      // disable correct tools if no feature is selected
      if(!feature && ['correct-add', 'correct-remove'].includes(this.activeEditTool)) {
        this.activeEditTool = null;
      }
    },
    reviewMode(value) {
      if(value) {
        this.activeTool = 'select';
      }
    }
  },
  methods: {
    isToolDisplayed(tool) {
      return this.configUI[`project-tools-${tool}`];
    },

    isToolDisabled(tool) {
      if(!this.selectedFeature) {
        return true; // no feature selected -> all edit tools disabled
      }

      let ftr = this.selectedFeature;
      let annot = ftr.properties.annot;
      if(tool === 'accept') {
        return annot.type === AnnotationType.REVIEWED;
      }
      if(tool === 'reject') {
        return annot.type !== AnnotationType.REVIEWED;
      }

      if(!this.$store.getters['currentProject/canEditAnnot'](annot)) {
        return true;
      }

      let geomType = ftr.geometry.type;
      if(geomType === 'Point') {
        return (tool !== 'move' && tool !== 'delete'); // disable all tools except move and delete for points
      }
      else if(geomType === 'LineString') {
        return ['fill', 'correct-add', 'correct-remove'].includes(tool); // disable fill and correct tools for lines
      }
      else {
        return false;
      }
    },

    activateTool(tool) {
      this.activeTool = tool;
    },

    activateEditTool(tool) {
      this.activeTool = 'select';
      this.activeEditTool = (this.activeEditTool === tool) ? null : tool; // toggle behaviour
    },

    async fill() {
      let feature = this.selectedFeature;
      if(!feature) {
        return;
      }

      this.activateEditTool(null);
      let annot = feature.properties.annot.clone();

      try {
        await annot.fill();
        this.$eventBus.$emit('editAnnotation', annot);
        this.$store.commit(this.imageModule + 'addAction', {annot, type: Action.UPDATE});
      }
      catch(err) {
        this.$notify({type: 'error', text: this.$t('notif-error-annotation-fill')});
      }
    },

    async deleteAnnot() {
      let feature = this.selectedFeature;
      if(!feature) {
        return;
      }

      this.activateEditTool(null);

      try {
        let annot = feature.properties.annot;
        await Annotation.delete(annot.id);
        this.$eventBus.$emit('deleteAnnotation', annot);
        this.$store.commit(this.imageModule + 'addAction', {annot: annot, type: Action.DELETE});
      }
      catch(err) {
        this.$notify({type: 'error', text: this.$t('notif-error-annotation-deletion')});
      }
    },
    confirmDeletion() {
      if(!this.selectedFeature) {
        return;
      }

      this.$buefy.dialog.confirm({
        title: this.$t('confirm-deletion'),
        message: this.$t('confirm-deletion-annotation'),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.deleteAnnot()
      });
    },


    async undo() {
      if(this.actions.length === 0) {
        return;
      }

      let action = this.actions[this.actions.length - 1];
      try {
        let opposedAction = await this.reverseAction(action, true);
        this.$store.commit(this.imageModule + 'undoAction', opposedAction);
      }
      catch(err) {
        console.log(err);
        this.$notify({type: 'error', text: this.$t('notif-error-undo')});
      }
    },
    async redo() {
      if(this.undoneActions.length === 0) {
        return;
      }

      let action = this.undoneActions[this.undoneActions.length - 1];
      try {
        let opposedAction = await this.reverseAction(action, false);
        this.$store.commit(this.imageModule + 'redoAction', opposedAction);
      }
      catch(err) {
        console.log(err);
        this.$notify({type: 'error', text: this.$t('notif-error-redo')});
      }
    },
    async reverseAction({annot, type, command}, undo) {
      let newType = type;

      if(type === Action.CREATE) {
        await Annotation.delete(annot.id);
        this.$eventBus.$emit('deleteAnnotation', annot);
        newType = Action.DELETE;
        command = Cytomine.instance.lastCommand;
      }
      else if(type === Action.DELETE) {
        let collection = await Cytomine.instance.undo(command); // always undo if annotation was deleted
        let newAnnot = await this.getUpdatedAnnotation(collection);
        this.$eventBus.$emit('addAnnotation', newAnnot);
        newType = Action.CREATE;
      }
      else { // annotation was updated
        let collection;
        if(undo) {
          collection = await Cytomine.instance.undo(command);
        }
        else {
          collection = await Cytomine.instance.redo(command);
        }
        let newAnnot = await this.getUpdatedAnnotation(collection);
        this.$eventBus.$emit('editAnnotation', newAnnot);
      }

      return {annot, command, type: newType};
    },
    async getUpdatedAnnotation(collection) {
      for(let model of collection) {
        let jsonAnnot = model.annotation || model.reviewedannotation;
        if(jsonAnnot) {
          let annot = new Annotation(jsonAnnot);
          await updateTermProperties(annot);
          return annot;
        }
      }
    },

    async accept() {
      let feature = this.selectedFeature;
      if(!feature) {
        return;
      }

      this.activateEditTool(null);
      let annot = feature.properties.annot;
      if(annot.type === AnnotationType.REVIEWED) {
        return;
      }

      try {
        let reviewedAnnot = await annot.review();
        reviewedAnnot.userByTerm = annot.userByTerm; // copy terms from initial annot
        this.$eventBus.$emit('reviewAnnotation', annot);
        this.$eventBus.$emit('addAnnotation', reviewedAnnot);
        this.$eventBus.$emit('selectAnnotation', {index: this.index, annot: reviewedAnnot});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-annotation-validation')});
      }
    },
    async reject() {
      let feature = this.selectedFeature;
      if(!feature) {
        return;
      }

      this.activateEditTool(null);
      let reviewedAnnot = feature.properties.annot;
      if(reviewedAnnot.type !== AnnotationType.REVIEWED) {
        return;
      }

      try {
        let annot = await Annotation.fetch(reviewedAnnot.parentIdent);
        annot.userByTerm = reviewedAnnot.userByTerm; // copy terms from reviewed annot
        await annot.cancelReview();
        this.$eventBus.$emit('deleteAnnotation', reviewedAnnot);
        this.$eventBus.$emit('addAnnotation', annot, false);
        this.$eventBus.$emit('selectAnnotation', {index: this.index, annot});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-annotation-rejection')});
      }
    },

    shortkeyHandler(key) {
      if(!this.isActiveImage) { // shortkey should only be applied to active map
        return;
      }

      switch(key) {
        case 'tool-select':
          if (this.isToolDisplayed('select')){
            this.activateTool('select');
          }
          return;
        case 'tool-point':
          if (this.isToolDisplayed('point') && !this.disabledDraw) {
            this.activateTool('point');
          }
          return;
        case 'tool-line':
          if (this.isToolDisplayed('line') && !this.disabledDraw) {
            this.activateTool('line');
          }
          return;
        case 'tool-freehand-line':
          if (this.isToolDisplayed('freehand-line') && !this.disabledDraw) {
            this.activateTool('freehand-line');
          }
          return;
        case 'tool-rectangle':
          if (this.isToolDisplayed('rectangle') && !this.disabledDraw) {
            this.activateTool('rectangle');
          }
          return;
        case 'tool-circle':
          if (this.isToolDisplayed('circle') && !this.disabledDraw) {
            this.activateTool('circle');
          }
          return;
        case 'tool-polygon':
          if (this.isToolDisplayed('polygon') && !this.disabledDraw) {
            this.activateTool('polygon');
          }
          return;
        case 'tool-freehand-polygon':
          if (this.isToolDisplayed('polygon') && !this.disabledDraw) {
            this.activateTool('freehand-polygon');
          }
          return;
        case 'tool-delete':
          if (this.isToolDisplayed('delete') && !this.isToolDisplayed('delete')) {
            this.confirmDeletion();
          }
          return;
        case 'tool-undo':
          if (this.isToolDisplayed('undo')) {
            this.undo();
          }
          return;
        case 'tool-redo':
          if (this.isToolDisplayed('redo')) {
            this.redo();
          }
          return;
        case 'tool-review-accept':
          if (this.reviewMode && this.isToolDisplayed('accept')) {
            this.accept();
          }
          return;
        case 'tool-review-reject':
          if (this.reviewMode && this.isToolDisplayed('reject')) {
            this.reject();
          }
          return;
        case 'tool-fill':
          if (this.isToolDisplayed('fill') && !this.isToolDisabled('fill')) {
            this.fill();
          }
          return;
        case 'tool-correct-add':
          if (this.isToolDisplayed('union') && !this.isToolDisabled('correct-add')) {
            this.activateEditTool('correct-add');
          }
          return;
        case 'tool-correct-remove':
          if (this.isToolDisplayed('diff') && !this.isToolDisabled('correct-remove')) {
            this.activateEditTool('correct-remove');
          }
          return;
        case 'tool-modify':
          if (this.isToolDisplayed('edit') && !this.isToolDisabled('edit')) {
            this.activateEditTool('modify');
          }
          return;
        case 'tool-move':
          if (this.isToolDisplayed('move') && !this.isToolDisabled('move')) {
            this.activateEditTool('translate');
          }
          return;
        case 'tool-rotate':
          if (this.isToolDisplayed('rotate') && !this.isToolDisabled('rotate')) {
            this.activateEditTool('rotate');
          }
          return;
        case 'toggle-current':
          if (this.configUI['project-explore-annotation-main'] && this.selectedFeature) {
            this.displayAnnotDetails = !this.displayAnnotDetails;
          }
          return;
      }
    }
  },
  mounted() {
    this.$eventBus.$on('shortkeyEvent', this.shortkeyHandler);
  },
  beforeDestroy() {
    this.$eventBus.$off('shortkeyEvent', this.shortkeyHandler);
  }
};
</script>

<style scoped>
.buttons {
  float:left;
  margin-left: 1px;
  margin-right: 1px;
  margin-bottom: 0 !important;
}

.button {
  margin-bottom:0px !important;
}

.superscript {
  position: relative;
  bottom: 0.65em;
  left: 1px;
  font-size: 0.7em;
}

:focus {outline:none;}
::-moz-focus-inner {border:0;}

.term-selection {
  position: relative;
}

.term-selection.has-preview i.fas {
  position: relative;
  right: 0.25em;
  top: 0.2em;
  font-size: 0.9em;
}

.term-selection .ontology-tree-container {
  position: absolute;
  top: 100%;
  left: -1.5em;
  margin-top: 5px;
  background: white;
  min-width: 18em;
  max-width: 20vw;
  max-height: 40vh;
  overflow: auto;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  border-radius: 4px;
}

.term-selection:not(.has-preview) .color-preview {
  display:none;
}

.color-preview {
  width: 1em;
  height: 1em;
  display: inline-block;
  border-radius: 0.45em;
  position: absolute;
  top: 0.25em;
  right: 0.25em;
  z-index: 1000;
  pointer-events: none;
  font-size: 0.7em;
  font-weight: 600;
  text-align:center;
  line-height: 0.9em;
  font-family: Arial;
}
</style>

<style lang="scss">
$colorActiveIcon: #fff;

.draw-tools-wrapper {

  .term-selection .ontology-tree-container {

    .control {
      margin: 0.75em;
      margin-bottom: 0;
    }

    .ontology-tree {
      padding: 0.75em 0;
    }
  }

  .button.is-selected {
    background-color: #6899d0;
    color: $colorActiveIcon;

    path {
      stroke: $colorActiveIcon;
    }
  }

  .icon svg {
    height: 1.15em !important;
  }
}
</style>
