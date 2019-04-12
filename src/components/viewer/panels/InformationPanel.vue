<template>
<div>
  <h1>
    {{$t('information')}}
  </h1>
  <table class="table">
    <tbody>
      <tr>
        <td><strong>{{$t('name')}}</strong></td>
        <td><image-name :image="image" showBothNames /></td>
      </tr>
      <tr>
        <td><strong>{{$t('width')}}</strong></td>
        <td>{{image.width}}</td>
      </tr>
      <tr>
        <td><strong>{{$t('height')}}</strong></td>
        <td>{{image.height}}</td>
      </tr>
      <tr>
        <td><strong>{{$t('resolution')}}</strong></td>
        <td>{{resolution}}</td>
      </tr>
      <tr>
        <td><strong>{{$t('magnification')}}</strong></td>
        <td>{{magnification}}</td>
      </tr>
      <tr>
        <td colspan="2">
          <div class="buttons">
            <button v-if="canEdit" class="button is-small" @click="calibrationModal = true">
              {{$t('button-set-calibration')}}
            </button>
            <router-link :to="`/project/${image.project}/image/${image.id}/information`" class="button is-small">
              {{$t('button-more-info')}}
            </router-link>
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <div class="buttons navigation has-addons">
            <button class="button is-small" @click="previousImage()" :disabled="isFirstImage">
              <i class="fas fa-angle-left fa-lg"></i> {{$t('button-previous-image')}}
            </button>
            <button class="button is-small" @click="nextImage()" :disabled="isLastImage">
              {{$t('button-next-image')}} <i class="fas fa-angle-right fa-lg"></i>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <calibration-modal
    :image="image"
    :active.sync="calibrationModal"
    @setResolution="setResolution"
  />
</div>
</template>

<script>
import ImageName from '@/components/image/ImageName';
import CalibrationModal from '@/components/image/CalibrationModal';

export default {
  name: 'information-panel',
  components: {
    ImageName,
    CalibrationModal
  },
  props: {
    idViewer: String,
    index: Number
  },
  data() {
    return {
      calibrationModal: false,
      isFirstImage: false,
      isLastImage: false
    };
  },
  computed: {
    viewerWrapper() {
      return this.$store.state.images.viewers[this.idViewer];
    },
    image() {
      return this.viewerWrapper.maps[this.index].imageInstance;
    },
    resolution() {
      if(this.image.resolution) {
        return this.image.resolution.toFixed(3);
      }
      else {
        return this.$t('unknown');
      }
    },
    magnification() {
      return this.image.magnification || this.$t('unknown');
    },
    canEdit() {
      return this.$store.getters.canEditImage(this.image);
    },
    isActiveMap() {
      return this.viewerWrapper.activeMap === this.index;
    }
  },
  methods: {
    setResolution(resolution) {
      this.$store.commit('setResolution', {idViewer: this.idViewer, idImage: this.image.id, resolution});
      // refresh the sources to update perimeter/area
      this.$eventBus.$emit('reloadAnnotations', this.image.id);
    },
    async previousImage() {
      try {
        let prev = await this.image.fetchPrevious();
        if(!prev.id) {
          this.$notify({type: 'error', text: this.$t('notif-error-first-image')});
          this.isFirstImage = true;
        }
        else {
          await this.$store.dispatch('setImageInstance', {
            idViewer: this.idViewer,
            index: this.index,
            image: prev
          });
        }
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-fetch-previous-image')});
      }
    },
    async nextImage() {
      try {
        let next = await this.image.fetchNext();
        if(!next.id) {
          this.$notify({type: 'error', text: this.$t('notif-error-last-image')});
          this.isLastImage = true;
        }
        else {
          await this.$store.dispatch('setImageInstance', {
            idViewer: this.idViewer,
            index: this.index,
            image: next
          });
        }
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-fetch-next-image')});
      }
    },

    shortkeyHandler(key) {
      if(!this.isActiveMap) { // shortkey should only be applied to active map
        return;
      }

      if(key === 'n') {
        this.nextImage();
      }
      else if(key === 'p') {
        this.previousImage();
      }
    }
  },
  mounted() {
    this.$eventBus.$on('shortkeyEvent', this.shortkeyHandler);
  },
  beforeDestroy() {
    this.$eventBus.$off('shortkeyEvent', this.shortkeyHandler);
  }
};
</script>

<style scoped>
.table {
  margin-bottom: 0px !important;
  width: 100%;
  table-layout: fixed;
}

td {
  word-wrap: break-word;
}

td:first-child {
  width: 120px;
}

.buttons {
  justify-content: center;
}

.buttons.navigation {
  margin-top: 10px;
  margin-bottom: 0px;
  border-width: 0px;
}

.fa-angle-left {
  margin-right: 5px;
}

.fa-angle-right {
  margin-left: 5px;
}
</style>
