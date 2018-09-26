<template>
<span v-if="user">
    <span :class="[online ? 'online-dot' : 'offline-dot']" v-if="online != null"></span>
    {{user.firstname}} {{user.lastname}} ({{user.username}})</span></template>

<script>
export default {
    name: "username",
    props: ["user", "online"]
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
