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
  <div class="box error" v-if="currentUser.guestByNow">
    <h2> {{ $t('access-denied') }} </h2>
    <p>{{ $t('insufficient-permission') }}</p>
  </div>
  <div class="storage-wrapper content-wrapper" v-else>
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li><router-link :to="`/storages`">{{$t('storages')}}</router-link></li>
        <li class="is-active"><a href="#" aria-current="page">{{storage.name}}</a></li>
      </ul>
    </nav>
    <list-uploaded-files></list-uploaded-files>
  </div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import ListUploadedFiles from './ListUploadedFiles';
export default {
  name: 'storage-files',
  components: {
    ListUploadedFiles,
  },
  computed: {
    currentUser: get('currentUser/user'),
    storage: get('currentStorage/storage'),
  }
};
</script>

<style>
.storage-wrapper {
  margin-bottom: 0;
}

.storage-wrapper {
  margin-right: 0.75em;
  position: relative;
  bottom: 4px;
}

</style>
