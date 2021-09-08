<!-- Copyright (c) 2009-2021. Authors: see NOTICE file.

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
<cytomine-modal-card :title="title" active>

  <article class="message is-info" v-if="explaination">
    <section class="message-body">
      <div class="media">
        <div class="media-left">
          <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
        </div>
        <div class="media-content">
          {{explaination}}
        </div>
      </div>
    </section>
  </article>

  <b-loading :is-full-page="false" :active="loading" class="small" />
  <template v-if="!loading">
    <b-field>
      <b-input v-model="configurationValue" :placeholder="placeholder" />
    </b-field>
  </template>

  <template #footer>
    <button class="button" @click="$parent.close()">
      {{$t('button-cancel')}}
    </button>
    <button class="button is-link" @click="addValue">
      {{$t('button-save')}}
    </button>
  </template>
</cytomine-modal-card>
</template>

<script>

import CytomineModalCard from '@/components/utils/CytomineModalCard';

export default {
  name: 'add-configuration-value-modal',
  props: {
    initialConfigurationValue: String,
    title: String,
    placeholder: String,
    explaination: String
  },
  components: {
    CytomineModalCard,
  },
  data() {
    return {
      configurationValue: this.initialConfigurationValue
    };
  },
  methods: {
    async addValue() {
      this.$emit('addObjects', this.configurationValue);
      this.$parent.close();
    },

  },
  async created() {
    this.loading = false;
  }
};
</script>

<style scoped>
>>> .modal-card, >>> .modal-card-body {
  overflow: visible !important;
}

</style>
