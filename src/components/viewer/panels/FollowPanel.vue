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
<div class="follow-panel">
  <h1>{{$t('broadcast')}}</h1>

  <div>
    <b-checkbox v-model="broadcastModel" type="is-info" :disabled="disabledBroadcast">
      {{$t('broadcast-my-position')}}
    </b-checkbox>
  </div>

  <h2 :class="{disabled: broadcast}">{{$t('follow-user')}}</h2>

  <div class="follow-panel-content" :class="{disabled: broadcast}">
    <div class="field">
      <b-radio v-model="trackedUserModel" :native-value="null" type="is-info" :disabled="broadcast">
        {{$t('no-tracking')}}
      </b-radio>
    </div>

    <template v-if="onlineManagers.length > 0">
      <h3>{{$t('online-managers')}}</h3>
      <div class="field" v-for="user in onlineManagers" :key="user.id">
        <b-radio v-model="trackedUserModel" :native-value="user.id" type="is-info" :disabled="broadcast">
          <username :user="user" />
        </b-radio>
      </div>
    </template>

    <template v-if="onlineContributors.length > 0">
      <h3>{{$t('online-contributors')}}</h3>
      <div class="field" v-for="user in onlineContributors" :key="user.id">
        <b-radio v-model="trackedUserModel" :native-value="user.id" type="is-info" :disabled="broadcast">
          <username :user="user" />
        </b-radio>
      </div>
    </template>
  </div>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import Username from '@/components/user/Username';

import {UserPosition} from 'cytomine-client';

import constants from '@/utils/constants.js';

export default {
  name: 'follow-panel',
  components: {Username},
  props: {
    index: String,
    view: Object
  },
  data() {
    return {
      onlineUsers: [],

      broadcastModel: false,
      trackedUserModel: null,

      timeoutOnlineUsers: null,
      timeoutTracking: null,

      disabledBroadcast: false
    };
  },
  computed: {
    projectMembers: get('currentProject/members'),
    projectManagers: get('currentProject/managers'),
    projectContributors() {
      return this.$store.getters['currentProject/contributors'];
    },
    currentUser: get('currentUser/user'),
    project: get('currentProject/project'),
    blindMode() {
      return this.project.blindMode;
    },
    viewerModule() {
      return this.$store.getters['currentProject/currentViewerModule'];
    },
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    viewerWrapper() {
      return this.$store.getters['currentProject/currentViewer'];
    },
    images() {
      return this.viewerWrapper.images;
    },
    linkedIndexes() {
      return this.viewerWrapper.links.find(group => group.includes(this.index)) || [];
    },
    linkedIndexTracking() { // true if current view is linked with another view with tracking enabled
      return this.linkedIndexes.some(idx => idx !== this.index && this.images[idx].tracking.trackedUser);
    },
    imageWrapper() {
      return this.viewerWrapper.images[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    activePanel() {
      return this.imageWrapper.activePanel;
    },
    broadcast: {
      get() {
        return this.imageWrapper.tracking.broadcast;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setBroadcast', value);
      }
    },
    alreadyBroadcastingImage() {
      return Object.keys(this.images).some(index => {
        let image = this.images[index];
        return index !== this.index && image.imageInstance
          && image.imageInstance.id === this.image.id && image.tracking.broadcast;
      });
    },
    trackedUser: {
      get() {
        return this.imageWrapper.tracking.trackedUser;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setTrackedUser', value);
      }
    },
    onlineManagers() {
      return this.projectManagers.filter(({id}) => this.onlineUsers.includes(id));
    },
    onlineContributors() {
      return this.projectContributors.filter(({id}) => this.onlineUsers.includes(id));
    },
    trackedUserFullName() {
      let trackedUser = this.projectMembers.find(user => user.id === this.trackedUser);
      if(trackedUser) {
        return trackedUser.fullName;
      }
    }
  },
  watch: {
    activePanel(panel) {
      if(panel === 'follow') {
        this.fetchOnline();
      }
    },

    broadcast() {
      if(this.broadcast) {
        this.trackedUser = null;
      }
    },

    alreadyBroadcastingImage(value) {
      if(!value) {
        this.disabledBroadcast = false;
      }
    },

    broadcastModel(value) {
      if(value && this.alreadyBroadcastingImage) {
        this.$notify({type: 'error', text: this.$t('notif-error-already-broadcasting-this-image')});
        this.disabledBroadcast = true;
        this.$nextTick(() => this.broadcastModel = false);
        return;
      }

      this.broadcast = value;
    },

    trackedUserModel(value) {
      // if map is linked to another map on which tracking is already enabled, possible conflict
      if(value && this.linkedIndexTracking) {
        this.$buefy.dialog.confirm({
          title: this.$t('possible-conflict'),
          message: this.$t('confirm-unlink-view-to-track'),
          confirmText: this.$t('button-confirm'),
          cancelText: this.$t('button-cancel'),
          onConfirm: () => {
            this.$store.commit(this.viewerModule + 'unlinkImage', {indexImage: this.index});
            this.trackedUser = value;
          },
          onCancel: () => this.trackedUserModel = null
        });
      }
      else {
        this.trackedUser = value;
      }
    },

    trackedUser(id) {
      this.trackedUserModel = id;

      if(id) {
        this.track();
        this.fetchOnline();
      }
    },

    onlineUsers(onlines) {
      if(this.trackedUser && !onlines.includes(this.trackedUser)) {
        this.$notify({
          type: 'info',
          text: this.$t('end-tracking-user-no-longer-broadcasting', {
            username: this.trackedUserFullName,
            imageName: this.blindMode ? this.image.blindedName : this.image.instanceFilename
          })
        });
        this.trackedUser = null;
      }
    }

  },
  methods: {
    async track() {
      if(!this.trackedUser) {
        return;
      }

      try {
        let pos = await UserPosition.fetchLastPosition(this.image.id, this.trackedUser);
        if(!pos.id || !pos.broadcast) {
          return;
        }

        this.view.animate({
          center: [pos.x, pos.y],
          zoom: pos.zoom,
          rotation: pos.rotation,
          duration: 500
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-tracked-user-position')});
      }

      clearTimeout(this.timeoutTracking);
      this.timeoutTracking = setTimeout(this.track, constants.TRACKING_REFRESH_INTERVAL);
    },

    async fetchOnline() {
      if(!this.trackedUser && this.activePanel !== 'follow') { // if panel not opened and no tracking ongoing, no need to refresh the data
        return;
      }

      let onlines = await this.image.fetchConnectedUsers(true); // retrieve broadcasting users
      this.onlineUsers = onlines.filter(id => id !== this.currentUser.id);

      clearTimeout(this.timeoutOnlineUsers);
      this.timeoutOnlineUsers = setTimeout(this.fetchOnline, constants.BROADCASTING_USERS_REFRESH_INTERVAL);
    },
  },
  created() {
    this.trackedUserModel = this.trackedUser;
    this.broadcastModel = this.broadcast;

    this.fetchOnline();
    this.track();
  },
  beforeDestroy() {
    clearTimeout(this.timeoutTracking);
    clearTimeout(this.timeoutOnlineUsers);
  }
};
</script>

<style scoped>
h2 {
  margin-top: 0.8em;
  margin-bottom: 0.4em;
  font-size: 1em;
}

h3 {
  margin-top: 0.8em;
  margin-bottom: 0.4em;
  font-weight: 600;
}

.disabled {
  color: #7a7a7a;
}

.follow-panel-content {
  max-height: 14em;
  overflow: auto;
}
</style>

<style>
.follow-panel .b-checkbox {
  align-items: flex-start !important;
}
</style>
