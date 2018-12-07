<template>
<div class="follow-panel">
    <h1>{{$t("broadcast")}}</h1>

    <div>
        <b-checkbox v-model="broadcast" :native-value="null" type="is-info">
            {{$t("broadcast-my-position")}}
        </b-checkbox>
    </div>

    <h2 :class="{disabled: broadcast}">{{$t("follow-user")}}</h2>

    <div class="follow-panel-content" :class="{disabled: broadcast}">
        <div>
            <b-radio v-model="trackedUserModel" :native-value="null" type="is-info" :disabled="broadcast">
                {{$t("no-tracking")}}
            </b-radio>
        </div>

        <template v-if="onlineManagers.length > 0">
            <h3>{{$t("online-managers")}}</h3>
            <div v-for="user in onlineManagers" :key="user.id">
                <b-radio v-model="trackedUserModel" :native-value="user.id" type="is-info" :disabled="broadcast">
                    <username :user="user"></username>
                </b-radio>
            </div>
        </template>

        <template v-if="onlineContributors.length > 0">
            <h3>{{$t("online-contributors")}}</h3>
            <div v-for="user in onlineContributors" :key="user.id">
                <b-radio v-model="trackedUserModel" :native-value="user.id" type="is-info" :disabled="broadcast">
                    <username :user="user"></username>
                </b-radio>
            </div>
        </template>
    </div>
</div>
</template>

<script>
import Username from "@/components/utils/Username";
import {fullName} from "@/utils/user-utils.js";

import {UserPosition} from "cytomine-client";

export default {
    name: "follow-panel",
    components: {Username},
    props: [
        "idViewer",
        "index",
        "project",
        "view"
    ],
    data() {
        return {
            onlineUsers: [],

            trackedUserModel: null,

            timeoutOnlineUsers: null,
            timeoutTracking: null
        };
    },
    computed: {
        currentUser() {
            return this.$store.state.currentUser.user;
        },
        viewerWrapper() {
            return this.$store.state.images.viewers[this.idViewer];
        },
        maps() {
            return this.viewerWrapper.maps;
        },
        linkedIndexes() {
            return this.viewerWrapper.links.find(group => group.includes(this.index)) || [];
        },
        linkedIndexTracking() { // true if current view is linked with another view with tracking enabled
            return this.linkedIndexes.any(idx => idx != this.index && this.maps[idx].trackedUser != null);
        },
        imageWrapper() {
            return this.viewerWrapper.maps[this.index];
        },
        image() {
            return this.imageWrapper.imageInstance;
        },
        activePanel() {
            return this.imageWrapper.activePanel;
        },
        broadcast: {
            get() {
                return this.imageWrapper.broadcast;
            },
            set(value) {
                // QUESTION: forbid user to broadcast several times the same image
                this.$store.commit("setBroadcast", {idViewer: this.idViewer, index: this.index, value});
            }
        },
        trackedUser: {
            get() {
                return this.imageWrapper.trackedUser;
            },
            set(value) {
                this.$store.commit("setTrackedUser", {idViewer: this.idViewer, index: this.index, idUser: value});
            }
        },
        onlineManagers() {
            return this.project.managers.filter(({id}) => this.onlineUsers.includes(id));
        },
        onlineContributors() {
            return this.project.contributors.filter(({id}) => this.onlineUsers.includes(id));
        },
        trackedUserFullName() {
            let allUsers = this.project.managers.concat(this.project.contributors);
            let trackedUser = allUsers.find(user => user.id == this.trackedUser);
            if(trackedUser != null) {
                return fullName(trackedUser);
            }
        }
    },
    watch: {
        activePanel(panel) {
            if(panel == "follow") {
                this.fetchOnline();
            }
        },

        broadcast() {
            if(this.broadcast) {
                this.trackedUser = null;
            }
        },

        trackedUserModel(value) {
            // if map is linked to another map on which tracking is already enabled, possible conflict
            if(value && this.linkedIndexes.some(idx => idx != this.index && this.maps[idx].trackedUser != null)) {
                this.$dialog.confirm({
                    title: this.$t("possible-conflict"),
                    message: this.$t("confirm-unlink-view-to-track"),
                    confirmText: this.$t("button-confirm"),
                    cancelText: this.$t("button-cancel"),
                    onConfirm: () => {
                        this.$store.commit("unlinkMap", {idViewer: this.idViewer, index: this.index});
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

            if(id != null) {
                this.track();
                this.fetchOnline();
            }
        },

        onlineUsers(onlines) {
            if(this.trackedUser != null && !onlines.includes(this.trackedUser)) {
                this.$notify({
                    type: "info",
                    text: this.$t("end-tracking-user-disconnected", {
                        username: this.trackedUserFullName,
                        imageName: this.image.instanceFilename
                    })
                });
                this.trackedUser = null;
            }
        }

    },
    methods: {
        async track() {
            if(this.trackedUser == null) {
                return;
            }
            // TODO in backend: fetchLastPosition() allowed only if targetted user is broadcasting
            let pos = await UserPosition.fetchLastPosition(this.image.id, this.trackedUser);
            this.view.animate({
                center: [pos.x, pos.y],
                zoom: pos.zoom,
                // rotation: pos.rotation, // TODO in core (https://github.com/cytomine/Cytomine-core/issues/1144)
                duration: 500
            });

            clearTimeout(this.timeoutTracking);
            this.timeoutTracking = setTimeout(this.track, 500);
        },

        async fetchOnline() { // TODO in backend: method for fetching only the users broadcasting
            if(this.trackedUser == null && this.activePanel != "follow") {
                return;
            }

            let onlines = await this.image.fetchConnectedUsers();
            this.onlineUsers = onlines.filter(id => id != this.currentUser.id);

            clearTimeout(this.timeoutOnlineUsers);
            this.timeoutOnlineUsers = setTimeout(this.fetchOnline, 10000);
        },
    },
    created() {
        this.trackedUserModel = this.trackedUser;

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
    margin-top: 10px;
    margin-bottom: 5px;
}

h3 {
    margin-top: 10px;
    margin-bottom: 5px;
    font-weight: bold;
}

.disabled {
    color: #7a7a7a;
}

.follow-panel-content {
    max-height: 250px;
    overflow: auto;
}
</style>

<style>
.follow-panel .b-checkbox {
    align-items: flex-start !important;
}
</style>
