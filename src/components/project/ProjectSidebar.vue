<template>
<div class="sidebar-wrapper" :class="{expanded: expanded}" ref="sidebar">
    <nav class="sidebar" @click="clickHandler">
        <h1 class="project-name">{{`${$t("project")}: ${project.name}`}}</h1>
        <ul>
            <template v-if="isTabDisplayed('images')">
                <router-link tag="li" :to="`/project/${project.id}/images`">
                    <a>
                        <i class="far fa-images"></i>
                        {{ $t("images") }}
                    </a>
                </router-link>
            </template>
            <router-link v-if="isTabDisplayed('annotations')" tag="li" :to="`/project/${project.id}/annotations`">
                <a>
                    <i class="far fa-edit"></i>
                    {{ $t("annotations") }}
                </a>
            </router-link>
            <router-link  v-if="isTabDisplayed('jobs')" tag="li" :to="`/project/${project.id}/analysis`">
                <a>
                    <i class="fas fa-tasks"></i>
                    {{ $t("analysis") }}
                </a>
            </router-link>
            <router-link v-if="isTabDisplayed('activities')" tag="li" :to="`/project/${project.id}/activity`">
                <a>
                    <i class="fas fa-tachometer-alt"></i>
                    {{ $t("activity") }}
                </a>
            </router-link>
            <router-link v-if="isTabDisplayed('information')" tag="li" :to="`/project/${project.id}/information`">
                <a>
                    <i class="fas fa-info-circle"></i>
                    {{ $t("information") }}
                </a>
            </router-link>
        </ul>
        <ul class="bottom-menu">
            <router-link v-if="isTabDisplayed('configuration')" tag="li" :to="`/project/${project.id}/configuration`">
                <a>
                    <i class="fas fa-cogs"></i>
                    {{ $t("configuration") }}
                </a>
            </router-link>
        </ul>
    </nav>

    <div class="arrow-sidebar" @click="expanded = false">
        <i></i>
    </div>
</div>
</template>

<script>
export default {
    name: "project-sidebar",
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        configUI() {
            return this.$store.state.project.configUI;
        },
        expanded: {
            get() {
                return this.$store.state.currentUser.expandedSidebar;
            },
            set(val) {
                this.$store.commit("setExpandedSidebar", val);
            }
        }
    },
    methods: {
        clickHandler(event) {
            let el = event.target;
            if(!this.expanded && el.tagName !== "I" && el.tagName !== "A") { // if user clicked on icon, navigation purpose => do not expand the nav bar
                this.expanded = true;
            }
        },
        isTabDisplayed(tab) {
            return this.configUI[`project-${tab}-tab`];
        },
        transitionEndHandler() { // led to a change of the size of the content div => need to reload OL map
            this.$eventBus.$emit("updateMapSize");
        }
    },
    mounted() {
        this.$refs.sidebar.addEventListener("transitionend", this.transitionEndHandler);
    },
    beforeDestroy() {
        this.$refs.sidebar.removeEventListener("transitionend", this.transitionEndHandler);
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

.sidebar-wrapper {
    display: flex;
    height: 100%;
    background: $background;
    overflow: hidden;
    transition: width .2s linear;
    width: 55px;
}

.sidebar-wrapper.expanded {
    width:218px;
}

.sidebar {
    width: 200px;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
}

.project-name {
    padding: 10px 0px 10px;
    width: 200px !important;
    line-height: 20px;
    text-align: center;
    color: $background;
    font-size: 1.1em;
    margin: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-size: 16px;
    text-align: center;
    font-weight: 600;
}

.sidebar-wrapper.expanded .project-name {
    color: $activeColor !important;
}

ul {
    width: 100%;
}

li {
    height: 4em;
}

.bottom-menu {
    position: absolute;
    bottom: 0px;
    left: 0px;
}

a {
    position: relative;
    display: block;
    font-size: 14px;
    height: 100%;
    font-weight: 600;
    color: $color;
    text-decoration: none;
    display: flex;
    align-items: center;
}

.fas, .far {
    font-size: 16px;
    width: 55px;
    text-align: center;
    flex-shrink: 0;
}

li a:hover {
    color: $hoverColor;
    background: $hoverBackground!important;
}

li.is-active a {
    box-shadow: inset 5px 0 0 $hoverBackground;
    color: $activeColor;
    background: $activeBackground;
}

.arrow-sidebar {
    width: 18px;
    border-left: 1px solid $border;
    background: $arrowBackground;
    justify-content: center;
    display:flex;
    align-items: center;
}

.arrow-sidebar i {
    border: solid $arrowColor;
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 3px;
    transform: rotate(135deg);
    margin-left: 3px;
}
</style>
