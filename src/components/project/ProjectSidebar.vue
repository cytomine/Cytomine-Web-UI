<!-- Source sidebar: https://codepen.io/oknoblich/pen/klnjw -->
<!-- TODO: animation for the closing/opening of the bar -->

<template>
<div class="sidebar-wrapper">
    <nav class="sidebar large" v-show="visibleSideBar">
        <div class="title-nav">
            <h1>{{`${$t("project")}: ${project.name}`}}</h1>
        </div>
        <ul>
            <router-link tag="li" :to="`/project/${project.id}/images`" class="images">
                <a>
                    <i class="fa fa-image"></i>
                    {{ $t("images") }}
                </a>
            </router-link>
            <router-link tag="li" class="image-link" v-for="image in images" :key="image.imageInstance.id"
            :to="`/project/${image.imageInstance.project}/image/${image.imageInstance.id}`">
                <a>
                    {{ image.imageInstance.instanceFilename }}
                </a>
                <!-- TODO
                <a class="close">
                    <i class="fa fa-times"></i>
                </a>-->
            </router-link>
            <router-link tag="li" :to="`/project/${project.id}/annotations`" class="annotations">
                <a>
                    <i class="fa fa-pencil-square-o"></i>
                    {{ $t("annotations") }}
                </a>
            </router-link>
            <router-link tag="li" :to="`/project/${project.id}/jobs`" class="jobs">
                <a>
                    <i class="fa fa-tasks"></i>
                    {{ $t("jobs") }}
                </a>
            </router-link>
            <router-link tag="li" :to="`/project/${project.id}/metrics`" class="metrics">
                <a>
                    <i class="fa fa-dashboard"></i>
                    {{ $t("metrics") }}
                </a>
            </router-link>
            <router-link tag="li" :to="`/project/${project.id}/information`" class="information">
                <a>
                    <i class="fa fa-info-circle"></i>
                    {{ $t("information") }}
                </a>
            </router-link>
            <router-link tag="li" :to="`/project/${project.id}/parameters`" class="parameters">
                <a>
                    <i class="fa fa-cogs"></i>
                    {{ $t("parameters") }}
                </a>
            </router-link>
        </ul>
    </nav>
    <div class="arrow-sidebar" @click="visibleSideBar = !visibleSideBar">
        <i :class="{'sidebar-opened': visibleSideBar}"></i>
    </div>
</div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "project-sidebar",
    props: ["project"],
    data() {
        return {
            visibleSideBar: true,
        };
    },
    computed: mapState({images: state => state.images.images})
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
    font-weight: bold;
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
    font-weight: bold;
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

.sidebar:not(.large) li:not(.image-link) .fa {
    font-size: 16px;
    margin-right: 12px;
}

.sidebar.large li:not(.image-link) .fa {
    display: block;
    font-size: 3vh;
    margin-bottom: 10px;
}

.sidebar li:not(.image-link) a:hover, .sidebar li:not(.image-link).is-active a, .sidebar li.is-active {
    background: #444 !important;
}

.sidebar li.images.is-active a { box-shadow: inset 5px 0 0 #bb5454, inset 6px 0 0 #222; }
.sidebar li.annotations.is-active a { box-shadow: inset 5px 0 0 #bba154, inset 6px 0 0 #222; }
.sidebar li.jobs.is-active a { box-shadow: inset 5px 0 0 #55bb55, inset 6px 0 0 #222; }
.sidebar li.metrics.is-active a { box-shadow: inset 5px 0 0 #54a1bb, inset 6px 0 0 #222; }
.sidebar li.information.is-active a { box-shadow: inset 5px 0 0 #6d54bb, inset 6px 0 0 #222; }
.sidebar li.parameters.is-active a { box-shadow: inset 5px 0 0 #b3b3b3, inset 6px 0 0 #222; }

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
