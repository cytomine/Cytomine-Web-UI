<!-- Copyright (c) 2009-2019. Authors: see NOTICE file.

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
<cytomine-modal-card :title="$t('hotkeys')" @close="$parent.close()">
  <div class="columns">
    <div class="column">
      <h2>{{$t('view')}}</h2>
      <ul>
        <li><i class="key fas fa-arrow-up"></i>{{$t('hotkey-move-up')}}</li>
        <li><i class="key fas fa-arrow-left"></i>{{$t('hotkey-move-left')}}</li>
        <li><i class="key fas fa-arrow-right"></i>{{$t('hotkey-move-right')}}</li>
        <li><i class="key fas fa-arrow-down"></i>{{$t('hotkey-move-down')}}</li>
        <li><i class="key fas fa-plus"></i>{{$t('hotkey-zoom-in')}}</li>
        <li><i class="key fas fa-minus"></i>{{$t('hotkey-zoom-out')}}</li>
        <li><span class="key">n</span> {{$t('hotkey-next-image')}}</li>
        <li><span class="key">p</span> {{$t('hotkey-previous-image')}}</li>
      </ul>
    </div>
    <div class="column">
      <h2>{{$t('draw')}}</h2>
      <ul>
        <li><span class="key">s</span> {{$t('hotkey-select')}}</li>
        <li><span class="key">o</span> {{$t('hotkey-point')}}</li>
        <li><span class="key">f</span> {{$t('hotkey-freehand')}}</li>
        <li><span class="key">d</span> {{$t('hotkey-delete')}}</li>
        <li><span class="key">Ctrl + Z</span> {{$t('hotkey-undo')}}</li>
        <li><span class="key">Ctrl + Y</span> {{$t('hotkey-redo')}}</li>
      </ul>
    </div>
    <div class="column">
      <h2>{{$t('review')}}</h2>
      <ul>
        <li><span class="key">a</span> {{$t('hotkey-accept-annotation')}}</li>
        <li><span class="key">r</span> {{$t('hotkey-reject-annotation')}}</li>
        <li><span class="key">t</span> {{$t('hotkey-toggle-review')}}</li>
      </ul>
    </div>
  </div>
</cytomine-modal-card>
</template>

<script>
import CytomineModalCard from '@/components/utils/CytomineModalCard';

export default {
  name: 'hotkeys-modal',
  components: {CytomineModalCard}
};
</script>

<style scoped>
.modal-card, .modal-card-body {
  width: 50vw;
  min-width: 600px;
  font-weight: normal;
}

.key {
  min-width: 3rem;
  height: 2.25rem;
  border: 1px solid #ddd;
  padding: 0.5em 1em !important;
  margin: 0 0.9em 0.7em 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  color: #888;
  background: #f8f8f8;
  font-weight: 600;
}
</style>

