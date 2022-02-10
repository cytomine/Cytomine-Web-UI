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
<div class="navbar-item has-dropdown is-hoverable">
  <span class="navbar-link" @mouseover="mouseOver()" @mouseleave="mouseLeave()" :style="style" tabindex="0">
    <i v-if="icon" :class="[iconPack, icon]"></i>
    {{title}}
    <b-tag v-if="tag" :type="tag.type">{{tag.text}}</b-tag>
  </span>
  <div class="navbar-dropdown" @mouseover="mouseOver()"  @mouseleave="mouseLeave()" :class="classes">
    <slot></slot>
  </div>
</div>
</template>

<script>
export default {
  name: 'navbar-dropdown',
  props: {
    icon: String,
    iconPack: {type: String, default: 'fas'},
    title: String,
    tag: Object,
    classes: Array,
    linkClasses: Object,
    listPathes: Array,
    fontColor: Object,
    backgroundColor: Object,
    hoverBackgroundColor: Object
  },
  data() {
    return {
      isActive: false,
      style: {backgroundColor: this.backgroundColor.color, color: this.fontColor}
    };
  },
  watch: {
    '$route.path': {
      handler() {
        this.isActive = false;
        this.checkItemSelected();
        // required so dropdown doesn't remain open on route change.
        document.activeElement.blur();
      },
      immediate: true
    }
  },
  methods: {
    mouseOver: function(){
      this.setStyleToColor(this.hoverBackgroundColor.color);
    },
    mouseLeave: function(){
      this.setStyle();
    },
    setStyle(){
      this.isActive ? this.setStyleToColor(this.hoverBackgroundColor.color) : this.setStyleToColor(this.backgroundColor.color);
    },
    setStyleToColor(color){
      this.style.backgroundColor = color;
    },
    checkItemSelected() {
      if (this.listPathes) {
        this.listPathes.forEach(path => {
          this.$route.path.match(path) ? this.isActive = true : '';
        });
      }
      this.setStyle();
    }
  },
  created() {
    this.style = {backgroundColor: this.backgroundColor.color, color: this.fontColor.color};
    this.checkItemSelected();
  }
};
</script>

<style>
.navbar-item .tag {
  margin-left: 0.5rem;
}
@media screen and (min-width: 1024px) {
  .navbar-item.is-hoverable:hover .navbar-dropdown {
    display: block;
  }
  .navbar-item.is-hoverable:focus-within:not(:hover) .navbar-dropdown {
    display: none;
  }
}
</style>
