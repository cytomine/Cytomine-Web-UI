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
  <span>
    <template v-if="!this.source">
      <em>{{$t('no-trusted-source')}}</em>
    </template>
    <template v-else>
      <i v-if="sourceCodeProviderIcon" :class="sourceCodeProviderIcon"></i> <span class="is-capitalized"> {{sourceCodeProvider}}</span> [{{source.username}}]
      <template v-if="source.prefix"> (with prefix "{{source.prefix}}") </template>
      <br><i v-if="environmentProviderIcon" :class="environmentProviderIcon"></i> <span class="is-capitalized"> {{environmentProvider}}</span> [{{source.dockerUsername}}]
    </template>
  </span>
</template>

<script>
export default {
  name: 'software-source',
  props: {
    source: {type: Object, default: null},
  },
  data() {
    return {
      supportedProviders: ['github', 'bitbucket', 'gitlab', 'docker']
    };
  },
  computed: {
    sourceCodeProvider() {
      let provider = (this.source) ? this.formatProvider(this.source.provider) : null;
      return provider ? provider : this.$t('unknown');
    },
    sourceCodeProviderIcon() {
      let provider = (this.source) ? this.formatProvider(this.source.provider) : null;
      return provider ? `fab fa-${provider} fa-fw` : null;
    },
    environmentProvider() {
      let provider = (this.source) ? this.formatProvider(this.source.environmentProvider || 'docker') : null;
      return provider ? provider : this.$t('unknown');
    },
    environmentProviderIcon() {
      let provider = (this.source) ? this.formatProvider(this.source.environmentProvider || 'docker') : null;
      return provider ? `fab fa-${provider} fa-fw` : null;
    }
  },
  methods: {
    formatProvider(provider) {
      provider = provider.toLowerCase();
      return this.supportedProviders.includes(provider) ? provider : null;
    }
  }
};
</script>

<style scoped>

</style>
