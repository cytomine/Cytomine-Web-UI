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
