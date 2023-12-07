<template>
    <div class="sidebar-wrapper" :class="{ expanded: expanded }" ref="viewer_sidebar">
        <nav class="sidebar" @click="clickHandler">
            <appengine-sidebar />

        </nav>

        <div class="arrow-sidebar" @click="expanded = false">
            <i></i>
        </div>
    </div>
</template>
  
<script>
import { get, sync } from '@/utils/store-helpers';
import AppEngineSidebar from '../../appengine/sidebar/AppEngineSidebar.vue';

export default {
    name: 'viewer-sidebar',
    components: {
        'appengine-sidebar': AppEngineSidebar
    },
    data() {
        return {
        };
    },
    computed: {
        project: get('currentProject/project'),
        expanded: sync('currentUser/expandedSidebar')
    },
    methods: {
        clickHandler(event) {
            let el = event.target;
            // expand if user clicked on any part of the sidebar
            if (!this.expanded) {
                this.expanded = true;
            }
        },
        transitionEndHandler() {
            // led to a change of the size of the content div => need to reload OL map
            // this to make sure that any one listing (CytomineImage.vue) will shrink the entire UI of what we see
            this.$eventBus.$emit('updateMapSize');
        }
    },
    mounted() {
        this.$refs.viewer_sidebar.addEventListener('transitionend', this.transitionEndHandler);
    },
    beforeDestroy() {
        this.$refs.viewer_sidebar.removeEventListener('transitionend', this.transitionEndHandler);
    }
};
</script>

<style lang="scss" scoped>
$background: #444;
$activeBackground: #4f4f4f;
$hoverBackground: #82aad8;
$color: #ccc;
$activeColor: #eee;
$hoverColor: white;
$arrowBackground: #484848;
$border: #383838;
$arrowColor: #888;

h1 {
    color: $color;
}

.sidebar-wrapper {
    display: flex;
    height: 100%;
    background: $background;
    overflow: hidden;
    transition: width .2s linear;
    width: 4rem;
}

.sidebar-wrapper.expanded {
    width: 16rem;
}

.sidebar {
    width: 16rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
}

.sidebar-title {
    padding: 0.8em 0em 0.8em;
    width: 14.5rem !important;
    line-height: 1.8rem;
    text-align: center;
    color: $background;
    font-size: 1rem;
    margin: 0;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    text-align: center;
    font-weight: 600;
}

.sidebar-wrapper.expanded .sidebar-title {
    color: $activeColor !important;
}

section {
    width: 100%;
    height: 3.5rem;
}

.bottom-menu {
    position: absolute;
    bottom: 0;
    left: 0;
}

.arrow-sidebar {
    width: 1.5rem;
    border-left: 1px solid $border;
    background: $arrowBackground;
    justify-content: center;
    display: flex;
    align-items: center;
}

.arrow-sidebar i {
    border: solid $arrowColor;
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 0.25rem;
    transform: rotate(135deg);
    margin-left: 0.25rem;
}
</style>
  