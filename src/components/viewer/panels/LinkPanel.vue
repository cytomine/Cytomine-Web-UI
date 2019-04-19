<template>
<div>
  <h1>{{$t('link-images')}}</h1>

  <p>{{$t('link-view-with')}}</p>
  <p v-for="{image, index} in otherMaps" :key="index">
    <b-checkbox
      :value="revisionCheckboxes && linkedIndexes.includes(index)"
      @input="value => handleCheckboxChange(index, value)"
    >
      {{$t('viewer-view', {number: index + 1})}} (<image-name :image="image" />)
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
    index: Number
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
    viewerWrapper() {
      return this.$store.getters.currentViewer;
    },
    maps() {
      return this.viewerWrapper.maps;
    },
    otherMaps() {
      return this.maps.reduce((arr, map, index) => {
        if(this.index !== index) {
          arr.push({
            index,
            image: map.imageInstance
          });
        }
        return arr;
      }, []);
    },
    linkedIndexes() {
      return this.viewerWrapper.links.find(group => group.includes(this.index)) || [];
    },
    trackedUser() {
      return this.viewerWrapper.maps[this.index].trackedUser;
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
              this.$store.commit(this.viewerModule + 'setTrackedUser', {index: this.index, idUser: null});
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
        this.$store.commit(this.viewerModule + 'unlinkMap', this.index);
      }
    },

    linkMaps(indexLinked) {
      this.$store.commit(this.viewerModule + 'linkMaps', [this.index, indexLinked]);
    }
  }
};
</script>
