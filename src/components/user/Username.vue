<template>
<span v-if="user">
    <span :class="[online ? 'online-dot' : 'offline-dot']" v-if="online !== null"></span>
    {{displayFullName ? fullName : user.username}}</span></template>

<script>
import {fullName} from "@/utils/user-utils.js";

export default {
    name: "username",
    props: {
        user: {type: Object},
        online: {type: Boolean, default: null},
        displayFullName: {type: Boolean, default: true}
    },
    computed: {
        fullName() {
            return fullName(this.user);
        }
    }
};
</script>

<style scoped>
.online-dot, .offline-dot {
    height: 10px;
    width: 10px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 2px;
}

.online-dot {
    background: limegreen;
}

.offline-dot {
    background: lightgrey;
}
</style>
