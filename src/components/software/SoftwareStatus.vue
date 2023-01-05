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
<span class="tag" :class="tagClass">
  {{$t(label)}}
</span>
</template>

<script>
export default {
  name: 'software-status',
  props: {
    software: Object
  },
  computed: {
    tagClass() {
      if(!this.software.softwareVersion) {
        return 'is-white';
      }
      if(this.software.deprecated) {
        return 'is-dark';
      }
      return 'is-info';
    },
    label() {
      if(!this.software.softwareVersion) {
        return 'no-info';
      }
      if(this.software.deprecated) {
        return 'deprecated';
      }
      return 'last-release';
    }
  }
};
</script>

<style scoped>

</style>
