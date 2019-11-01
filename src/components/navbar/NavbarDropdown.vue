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
<div class="navbar-item has-dropdown"
  :class="{'is-active': opened}"
  @mouseover="opened = true"
  @mouseout="opened = false"
>
  <a class="navbar-link" :class="{'is-active': isActive, ...linkClasses}">
    <i v-if="icon" :class="[iconPack, icon]"></i>
    {{title}}
    <b-tag v-if="tag" :type="tag.type">{{tag.text}}</b-tag>
  </a>
  <div class="navbar-dropdown" :class="classes" @click="opened = false;">
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
    listPathes: Array
  },
  data() {
    return {
      opened: false,
      isActive: false
    };
  },
  watch: {
    '$route.path': function(newPath) {
      if(this.listPathes) {
        this.isActive = this.listPathes.includes(newPath);
      }
    }
  },
  created() {
    if(this.listPathes) {
      this.isActive = this.listPathes.includes(this.$route.path);
    }
  }
};
</script>

<style>
.navbar-item .tag {
  margin-left: 0.5rem;
}
</style>
