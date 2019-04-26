<template>
<div class="image-calibration-wrapper">
  <b-modal :active="active" @close="$emit('update:active', false)" :has-modal-card="true">
    <form @submit.prevent="setResolution()">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{$t('calibrate-image')}}</p>
        </header>
        <section class="modal-card-body">
          <b-message type="is-warning" has-icon icon-size="is-small">
            {{ $t('warning-change-applies-in-project-only') }}
          </b-message>

          <b-field :label="$t('resolution')" :type="fieldType" :message="errors.first('resolution')">
            <b-field :type="fieldType">
              <b-input v-model="calibrationField" name="resolution" v-validate="'required|decimal|positive'" expanded />
              <b-select v-model="calibrationFactor">
                <option :value="0.001"> {{ $t('nm-per-pixel') }}</option>
                <option :value="1">{{ $t('um-per-pixel') }}</option>
                <option :value="1000">{{ $t('mm-per-pixel') }}</option>
              </b-select>
            </b-field>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <button class="button" type="button" @click="$emit('update:active', false)">
            {{$t('button-cancel')}}
          </button>
          <button class="button is-link" :disabled="errors.any()">
            {{$t('button-save')}}
          </button>
        </footer>
      </div>
    </form>
  </b-modal>
</div>
</template>

<script>
export default {
  name: 'calibration-modal',
  $_veeValidate: {validator: 'new'},
  props: {
    active: {type: Boolean},
    image: {type: Object}
  },
  data() {
    return {
      calibrationField: '',
      calibrationFactor: 1
    };
  },
  computed: {
    blindMode() {
      return this.$store.state.currentProject.project.blindMode;
    },
    fieldType() {
      return {'is-danger': this.errors.has('resolution')};
    }
  },
  watch: {
    active(val) {
      if(val) {
        this.calibrationField = this.image.resolution;
      }
    }
  },
  methods: {
    async setResolution() {
      let result = await this.$validator.validateAll();
      if(!result) {
        return;
      }

      let imageName = this.blindMode ? this.image.blindedName : this.image.instanceFilename;
      try {
        let updateImage = this.image.clone();
        updateImage.resolution = Number(this.calibrationField)*this.calibrationFactor;
        await updateImage.save();

        this.$emit('setResolution', updateImage.resolution);

        this.$notify({
          type: 'success',
          text: this.$t('notif-success-image-calibration', {imageName})
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-image-calibration', {imageName})
        });
      }
      this.$emit('update:active', false);
    }
  }
};
</script>
