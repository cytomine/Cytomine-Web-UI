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
  <div class="buttons are-small">
    <a :href="sourceCodeProviderLink" class="button" target="_blank">
      <i class="fas fa-external-link-alt fa-fw"></i> {{$t('see-source-code-on')}}
      <span class="is-capitalized">&nbsp;{{sourceCodeProvider}}</span>
    </a>
    <a :href="environmentProviderLink" class="button" target="_blank">
      <i class="fas fa-external-link-alt fa-fw"></i> {{$t('see-environment-on')}}
      <span class="is-capitalized">&nbsp;{{environmentProvider}}</span>
    </a>
  </div>
</template>

<script>
export default {
  name: 'software-source-buttons',
  props: {
    source: Object,
    software: Object
  },
  data() {
    return {
      supportedProviders: ['github', 'bitbucket', 'gitlab', 'docker']
    };
  },
  computed: {
    sourceCodeProvider() {
      let provider = this.formatProvider(this.source.provider);
      return provider ? provider : this.$t('unknown');
    },
    sourceCodeProviderIcon() {
      let provider = this.formatProvider(this.source.provider);
      return provider ? `fab fa-${provider} fa-fw` : null;
    },
    sourceCodeProviderLink() {
      let provider = this.formatProvider(this.source.provider);
      return `https://${provider}.com/${this.source.username}/${this.source.prefix}${this.software.name}/tree/${this.software.softwareVersion}`;
    },
    environmentProvider() {
      let provider = this.formatProvider(this.source.environmentProvider || 'docker');
      return provider ? provider : this.$t('unknown');
    },
    environmentProviderIcon() {
      let provider = this.formatProvider(this.source.environmentProvider || 'docker');
      return provider ? `fab fa-${provider} fa-fw` : null;
    },
    environmentProviderLink() {
      let provider = this.formatProvider(this.source.environmentProvider || 'docker');
      if (provider === 'docker') {
        return `https://hub.docker.com/r/${this.source.dockerUsername}/${this.source.prefix.toLowerCase()}${this.software.name.toLowerCase()}`;
      }

      return '';
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
.fa-fw {
  margin-right: 5px;
}
</style>
