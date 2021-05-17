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
<v-popover
  placement="right"
  trigger="manual"
  :open="opened"
  :auto-hide="false"
> <!-- autoHide leads to erratic behaviour when adding/showing DOM elements => handle display of popover manually -->

  <div class="annot-preview" :style="styleAnnotDetails" @click.self="viewAnnot()">
    <button class="button is-small" @click="opened = !opened" ref="previewButton">
      <i :class="['fas', opened ? 'fa-minus' : 'fa-plus']"></i>
    </button>
  </div>

  <template #popover>
    <annotation-details
      v-click-outside.capture="(event) => close(event)"
      :annotation="annot"
      :terms="terms"
      :users="users"
      :images="images"
      @addTerm="$emit('addTerm', $event)"
      @updateTerms="$emit('update')"
      @deletion="handleDeletion"
      v-if="opened"
    /> <!-- Display component only if it is the currently displayed annotation
            (prevents fetching unnecessary information) -->
  </template>
</v-popover>
</template>

<script>
import AnnotationDetails from './AnnotationDetails';

export default {
  name: 'annotation-preview',
  props: {
    annot: Object,
    size: Number,
    color: String,
    terms: Array,
    users: Array,
    images: Array
  },
  components: {AnnotationDetails},
  data() {
    return {
      opened: false
    };
  },
  computed: {
    styleAnnotDetails() {
      let outlineParams = this.color ? '&draw=true&color=0x' + this.color : '';
      let url = `${this.annot.url}?maxSize=${this.size}&square=true&complete=false&thickness=2&increaseArea=1.25${outlineParams}`;

      return {
        backgroundImage: `url(${url})`,
        backgroundRepeat: 'no-repeat',
        width: this.size + 'px',
        height: this.size + 'px'
      };
    }
  },
  methods: {
    viewAnnot() {
      this.$router.push(`/project/${this.annot.project}/image/${this.annot.image}/annotation/${this.annot.id}`);
    },
    close(event) {
      if(!this.opened) {
        return;
      }

      let el = event.target;
      while(el) {
        if(el.classList.contains('modal') || el.classList.contains('notifications') || el.isSameNode(this.$refs.previewButton)) {
          // do not close the popover if click was performed in modal or in notification
          // if click performed on previewButton, handled in @click
          return;
        }
        el = el.parentElement;
      }

      this.opened = false;
    },
    handleDeletion() {
      this.$eventBus.$emit('deleteAnnotation', this.annot);
      this.$emit('update');
    }
  }
};
</script>

<style scoped>
.annot-preview {
  display: inline-block;
  background-position: center center;
  background-repeat: no-repeat;
  margin: 10px;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  border: 3px solid white;
  cursor: pointer;
  text-align: right;
}

.annot-preview .button {
  font-size: 10px;
  width: 20px;
  height: 20px;
  box-sizing: border-box;
  position: relative;
  left: 3px;
  bottom: 3px;
  border: none;
}
</style>
