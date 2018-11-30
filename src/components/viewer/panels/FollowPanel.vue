<!-- TODO: prevent from tracking on a map linked to another map already in tracking mode -->
<template>
<div class="follow-panel">
    <h1>{{$t("follow-user")}}</h1>
    <div class="follow-panel-content">
        <div>
            <b-radio v-model="trackedUser" :native-value="null" type="is-info">
                {{$t("no-tracking")}}
            </b-radio>
        </div>

        <template v-if="onlineManagers.length > 0">
            <h2>{{$t("online-managers")}}</h2>
            <div v-for="user in onlineManagers" :key="user.id">
                <b-radio v-model="trackedUser" :native-value="user.id" type="is-info">
                    <username :user="user"></username>
                </b-radio>
            </div>
        </template>

        <template v-if="onlineContributors.length > 0">
            <h2>{{$t("online-contributors")}}</h2>
            <div v-for="user in onlineContributors" :key="user.id">
                <b-radio v-model="trackedUser" :native-value="user.id" type="is-info">
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

            intervalOnlineUsers: null,
            intervalTracking: null
        };
    },
    computed: {
        currentUser() {
            return this.$store.state.currentUser.user;
        },
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        image() {
            return this.imageWrapper.imageInstance;
        },
        activePanel() {
            return this.imageWrapper.activePanel;
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
                clearInterval(this.intervalOnlineUsers);
                this.intervalOnlineUsers = setInterval(() => this.fetchOnline(), 10000);
            }
            else if(this.trackedUser == null) {
                clearInterval(this.intervalOnlineUsers);
            }
        },

        trackedUser(id) {
            clearInterval(this.intervalTracking);

            if(id != null) {
                this.track();
                this.intervalTracking = setInterval(() => this.track(), 500);
                clearInterval(this.intervalOnlineUsers);
                this.intervalOnlineUsers = setInterval(() => this.fetchOnline(), 10000);
            }
            else if(this.activePanel != "follow") {
                clearInterval(this.intervalOnlineUsers);
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
            let pos = await UserPosition.fetchLastPosition(this.image.id, this.trackedUser);
            this.view.animate({
                center: [pos.x, pos.y],
                zoom: pos.zoom,
                // rotation: pos.rotation, // TODO in core (https://github.com/cytomine/Cytomine-core/issues/1144)
                duration: 500
            });
        },

        async fetchOnline() {
            let onlines = await this.image.fetchConnectedUsers();
            this.onlineUsers = onlines.filter(id => id != this.currentUser.id);
        }
    },
    created() {
        if(this.activePanel == "follow" || this.trackedUser != null) {
            this.fetchOnline();
            this.intervalOnlineUsers = setInterval(() => this.fetchOnline(), 10000);
        }

        if(this.trackedUser != null) {
            this.track();
            this.intervalTracking = setInterval(() => this.track(), 500);
        }
    },
    beforeDestroy() {
        clearInterval(this.intervalOnlineUsers);
        clearInterval(this.intervalTracking);
    }
};
</script>

<style scoped>
h2 {
    margin-top: 10px;
    margin-bottom: 5px;
}

.follow-panel-content {
    max-height: 250px;
    overflow: auto;
}
</style>
