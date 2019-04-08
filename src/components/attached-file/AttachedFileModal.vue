<template>
<div class="modal-card">
  <header class="modal-card-head">
    <p class="modal-card-title">{{$t('add-attached-file')}}</p>
  </header>
  <section class="modal-card-body">
    <b-field>
      <b-upload v-model="selectedFile" type="is-link" drag-drop>
        <section class="section">
          <div class="content has-text-centered">
            <template v-if="!selectedFile">
              <p><i class="fas fa-upload fa-3x"></i></p>
              <p>{{$t('choose-file-or-drop')}}</p>
            </template>
            <template v-else>
              <p class="filename is-size-4"><i class="fas fa-file"></i> {{selectedFile.name}}</p>
              <p class="has-text-grey is-size-6">{{$t('click-or-drop-new-file')}}</p>
            </template>
          </div>
        </section>
      </b-upload>
    </b-field>

    <b-field :label="$t('name')"
      :type="selectedFile && !validName ? 'is-danger' : ''"
      :message="selectedFile && !validName ? $t('field-cannot-be-empty') : ''"
    >
      <b-input v-model="name" :disabled="!selectedFile" />
    </b-field>
  </section>
  <footer class="modal-card-foot">
    <button class="button" @click="$parent.close()">
      {{$t('button-cancel')}}
    </button>
    <button class="button is-link" :disabled="!selectedFile || !validName" @click="save()">
      {{$t('button-save')}}
    </button>
  </footer>
</div>
</template>

<script>
import {AttachedFile} from 'cytomine-client';

export default {
  name: 'attached-file-modal',
  props: {
    object: Object
  },
  data() {
    return {
      selectedFile: null,
      name: ''
    };
  },
  computed: {
    validName() {
      return this.name.length > 0;
    }
  },
  watch: {
    selectedFile(file) {
      if(file) {
        this.name = file.name;
      }
    }
  },
  methods: {
    async save() {
      if(!this.selectedFile || !this.validName) {
        return;
      }

      try {
        let attached = await new AttachedFile({file: this.selectedFile, filename: this.name}, this.object).save();
        this.$emit('addAttachedFile', attached);
        this.$notify({type: 'success', text: this.$t('notif-success-attached-file-creation')});
        this.$parent.close();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-attached-file-creation')});
      }
    },
  }

};
</script>

<style scoped>
.filename {
  color: rgb(50, 115, 220);
}

.filename .fas {
  margin-right: 10px;
}

>>> .upload-draggable {
  margin-left: 10%;
  width: 80%;
}
</style>


