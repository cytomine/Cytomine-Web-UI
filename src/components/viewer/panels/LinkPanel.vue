<template>
<div>
  <h1>{{$t('link-images')}}</h1>

  <p>{{$t('link-view-with')}}</p>
  <p v-for="{image, index, count} in otherImages" :key="index">
    <b-checkbox
      :value="revisionCheckboxes && linkedIndexes.includes(index)"
      @input="value => handleCheckboxChange(index, value)"
    >
      {{$t('viewer-view', {number: count})}} (<image-name :image="image" />)
    </b-checkbox>
  </p>
</div>
</template>

<script>
import ImageName from '@/components/image/ImageName';

export default {
  name: 'link-panel',
  components: {ImageName},
  props: {
    index: String
  },
  data() {
    return {
      revisionCheckboxes: 1
    };
  },
  computed: {
    viewerModule() {
      return this.$store.getters.currentViewerModule;
    },
    imageModule() {
      return this.$store.getters.imageModule(this.index);
    },
    viewerWrapper() {
      return this.$store.getters.currentViewer;
    },
    images() {
      return this.viewerWrapper.images;
    },
    otherImages() {
      let count = 1;
      return Object.keys(this.images).reduce((arr, index) => {
        if(this.index !== index) {
          arr.push({
            count,
            index,
            image: this.images[index].imageInstance
          });
        }
        count++;
        return arr;
      }, []);
    },
    linkedIndexes() {
      return this.$store.getters[this.viewerModule + 'getLinkedIndexes'](this.index);
    },
    trackedUser() {
      return this.viewerWrapper.images[this.index].tracking.trackedUser;
    },
  },
  methods: {
    handleCheckboxChange(indexLinked, checked) {
      if(checked) {
        if(this.trackedUser) {
          this.$dialog.confirm({
            title: this.$t('possible-conflict'),
            message: this.$t('confirm-untrack-to-link-view'),
            confirmText: this.$t('button-confirm'),
            cancelText: this.$t('button-cancel'),
            onConfirm: () => {
              this.$store.commit(this.imageModule + 'setTrackedUser', null);
              this.linkMaps(indexLinked);
            },
            onCancel: () => this.revisionCheckboxes++ // To force the update of the checkbox state
          });
        }
        else {
          this.linkMaps(indexLinked);
        }
      }
      else {
        this.$store.commit(this.viewerModule + 'unlinkImage', this.index);
      }
    },

    linkMaps(indexLinked) {
      this.$store.commit(this.viewerModule + 'linkImages', [this.index, indexLinked]);
    }
  }
};
</script>
