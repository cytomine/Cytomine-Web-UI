<!-- Source sidebar: https://codepen.io/oknoblich/pen/klnjw -->
<!-- TODO: animation for the closing/opening of the bar -->

<template>
<div class="sidebar-wrapper">
    <nav class="sidebar large" v-show="visibleSideBar">
        <div class="title-nav">
            <h1>{{`${$t("project")}: ${project.name}`}}</h1>
        </div>
        <ul>
            <template v-if="isTabDisplayed('images')">
                <router-link tag="li" :to="`/project/${project.id}/images`" class="images">
                    <a>
                        <i class="far fa-images"></i>
                        {{ $t("images") }}
                    </a>
                </router-link>
            </template>
            <router-link v-if="isTabDisplayed('annotations')" tag="li" :to="`/project/${project.id}/annotations`" class="annotations">
                <a>
                    <i class="far fa-edit"></i>
                    {{ $t("annotations") }}
                </a>
            </router-link>
            <router-link  v-if="isTabDisplayed('jobs')" tag="li" :to="`/project/${project.id}/algorithms`" class="algorithms">
                <a>
                    <i class="fas fa-tasks"></i>
                    {{ $t("algorithms") }}
                </a>
            </router-link>
            <router-link v-if="isTabDisplayed('activity')" tag="li" :to="`/project/${project.id}/metrics`" class="metrics">
                <a>
                    <i class="fas fa-tachometer-alt"></i>
                    {{ $t("metrics") }}
                </a>
            </router-link>
            <router-link v-if="isTabDisplayed('info')" tag="li" :to="`/project/${project.id}/information`" class="information">
                <a>
                    <i class="fas fa-info-circle"></i>
                    {{ $t("information") }}
                </a>
            </router-link>
            <router-link  v-if="isTabDisplayed('configuration')" tag="li" :to="`/project/${project.id}/configuration`" class="configuration">
                <a>
                    <i class="fas fa-cogs"></i>
                    {{ $t("configuration") }}
                </a>
            </router-link>
        </ul>
    </nav>
    <div class="arrow-sidebar" @click="toggleSideBar">
        <i :class="{'sidebar-opened': visibleSideBar}"></i>
    </div>
</div>
</template>

<script>
export default {
    name: "project-sidebar",
    data() {
        return {
            visibleSideBar: true,
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        configUI() {
            return this.$store.state.project.configUI;
        }
    },
    methods: {
        toggleSideBar() {
            this.visibleSideBar = !this.visibleSideBar;
            this.$eventBus.$emit("updateMapSize");
        },
        isTabDisplayed(tab) {
            let displayed = this.configUI[`project-${tab}-tab`];
            return (displayed || displayed == null); // TODO: replace with return displayed once all tabs are managed in backend
        }
    }
};
</script>

<style scoped>
.sidebar-wrapper {
    display: flex;
    height: 100%;
    background: #333;
}

.sidebar {
    width: 220px;
    display: flex;
    flex-direction: column;
}

.title-nav {
    padding: 10px 0px 25px;
    line-height: 20px;
    text-align: center;
    color: #eee;
    border-bottom: 1px solid #222;
    background: #2a2a2a;
    font-size: 1.1em;
    margin: 0;
}

.title-nav h1 {
    letter-spacing: 2px;
    padding: 10px;
    text-transform: uppercase;
    font-size: 16px;
    text-align: center;
    padding: 10px;
    font-weight: 600;
}

.sidebar ul {
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.sidebar li:not(.image-link) {
    flex: 1;
}

.sidebar li:not(.image-link) a {
    position: relative;
    display: block;
    font-size: 14px;
    height: 100%;
    font-weight: 600;
    color: #eee;
    border-bottom: 1px solid #222;
    text-decoration: none;
    display: flex;
    align-items: center;
    padding-left: 20px;
    padding-right: 20px;
}

.sidebar.large li:not(.image-link) a {
    flex-direction: column;
    justify-content: center;
}

.sidebar:not(.large) li:not(.image-link) .fas, .sidebar:not(.large) li:not(.image-link) .far {
    font-size: 16px;
    margin-right: 8px;
    position: relative;
    top: 5px;
}

.sidebar.large li:not(.image-link) .fas, .sidebar.large li:not(.image-link) .far {
    display: block;
    font-size: 3vh;
    margin-bottom: 1.5vh;
    text-align: center;
}

.sidebar li:not(.image-link) a:hover, .sidebar li:not(.image-link).is-active a, .sidebar li.is-active {
    background: #444 !important;
}

.sidebar li.images.is-active a { box-shadow: inset 5px 0 0 #bb5454, inset 6px 0 0 #222; }
.sidebar li.annotations.is-active a { box-shadow: inset 5px 0 0 #bba154, inset 6px 0 0 #222; }
.sidebar li.algorithms.is-active a { box-shadow: inset 5px 0 0 #55bb55, inset 6px 0 0 #222; }
.sidebar li.metrics.is-active a { box-shadow: inset 5px 0 0 #54a1bb, inset 6px 0 0 #222; }
.sidebar li.information.is-active a { box-shadow: inset 5px 0 0 #6d54bb, inset 6px 0 0 #222; }
.sidebar li.configuration.is-active a { box-shadow: inset 5px 0 0 #b3b3b3, inset 6px 0 0 #222; }

.sidebar li.image-link {
    position: relative;
    display: block;
    padding: 12px;
    font-size: 12px;
    background-color: #3a3a3a;
    border-bottom: 1px solid #222;
    text-align: left;
    color: #eee;
}

.sidebar li.image-link a {
    color: #eee;
}

 .sidebar li.image-link a.close {
    float: right;
}

.arrow-sidebar {
    width: 20px;
    border-left: 1px solid #666;
    background: #444;
    color: white;
    justify-content: center;
    display:flex;
    align-items: center;
}

.arrow-sidebar i {
    border: solid white;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 3px;
    transform: rotate(-45deg);
    margin-right: 5px;
    margin-left: 0px;
}

.arrow-sidebar i.sidebar-opened {
    margin-right: 0px;
    margin-left: 3px;
    transform: rotate(135deg);
}
</style>
