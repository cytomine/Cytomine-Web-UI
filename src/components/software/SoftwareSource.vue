<template>
  <span>
    <i v-if="sourceCodeProviderIcon" :class="sourceCodeProviderIcon"></i> <span class="is-capitalized"> {{sourceCodeProvider}}</span> [{{source.username}}]
    <template v-if="source.prefix"> (with prefix "{{source.prefix}}") </template>
    <br><i v-if="environmentProviderIcon" :class="environmentProviderIcon"></i> <span class="is-capitalized"> {{environmentProvider}}</span> [{{source.dockerUsername}}]
  </span>
</template>

<script>
export default {
  name: 'software-source',
  props: {
    source: Object,
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
    environmentProvider() {
      let provider = this.formatProvider(this.source.environmentProvider || 'docker');
      return provider ? provider : this.$t('unknown');
    },
    environmentProviderIcon() {
      let provider = this.formatProvider(this.source.environmentProvider || 'docker');
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
