<template>
  <picture>
    <source :srcset="webpSrc" type="image/webp">
    <source :srcset="jpegSrc" type="image/jpeg">
    <img :src="jpegSrc" alt="" class="image-thumbnail">
  </picture>
</template>

<script>
export default {
  name: 'ImageThumbnail',
  props: {
    image: {type: Object, default: () => {}},
    macro: {type: Boolean, default: false}, // Ignored if URL is used
    url: {type: String, default: null}, // Cannot be null if image is null or empty
    size: {type: Number},
  },
  computed: {
    jpegSrc() {
      return this.formatSrc('jpg');
    },
    webpSrc() {
      return this.formatSrc('webp');
    },
    splitURL() {
      if (this.url === null) {
        return [];
      }

      let url = new URL(this.url);
      let pathname = url.pathname.split('.')[0];
      let params = url.searchParams;
      params.set('maxSize', this.size.toString());

      return {
        host: `${url.protocol}//${url.host}`,
        pathname: pathname,
        params: params
      };
    }
  },
  methods: {
    combineURL({host, pathname, format, params}) {
      return `${host}${pathname}.${format}?${params.toString()}`;
    },
    formatSrc(format) {
      if (this.url !== null) {
        return this.combineURL({format, ...this.splitURL});
      }
      if (this.macro) {
        return this.image.associatedImageURL('macro', this.size, format);
      }
      return this.image.thumbURL(this.size, format);
    }
  }
};
</script>

<style scoped>

</style>
