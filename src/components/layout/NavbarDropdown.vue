<template>
    <div class="navbar-item has-dropdown"
    :class="{'is-active': opened}"
    @mouseover="opened = true;"
    @mouseout="opened = false;">
    <a class="navbar-link" :class="{'is-active': isActive}">
        <i v-if="icon != null" :class="['fas', icon]"></i>
        {{title}}
        <b-tag v-if="tag" :type="tag.type">{{tag.text}}</b-tag>
    </a>
    <div class="navbar-dropdown" :class="classes" @click="opened = false;">
        <slot>
        </slot>
    </div>
</div>
</template>

<script>
export default {
    name: "navbar-dropdown",
    props: [
        "icon",
        "title",
        "tag",
        "classes",
        "listPathes"
    ],
    data() {
        return {
            opened: false,
            isActive: false
        };
    },
    // TODO: rework the way the background color is set when child element active
    watch: {
        "$route.path": function(newPath) {
            if(this.listPathes) {
                this.isActive = this.listPathes.includes(newPath);
            }
        }
    },
    created() {
        if(this.listPathes) {
            this.isActive = this.listPathes.includes(this.$route.path);
        }
    }
};
</script>

<style>
.navbar-item .tag {
    margin-left: 7px;
    position: relative;
    top: 1px;
}
</style>
