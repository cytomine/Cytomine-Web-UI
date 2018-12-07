<template>
<span v-if="user">
    <span :class="[online ? 'online-dot' : 'offline-dot']" v-if="online != null"></span>
    {{fullName}}</span></template>

<script>
import {fullName} from "@/utils/user-utils.js";

export default {
    name: "username",
    props: ["user", "online"],
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
