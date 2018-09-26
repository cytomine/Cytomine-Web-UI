<template>
<div id="app" class="wrapper">
    <notifications position="top center" width="30%" :max="5">
        <template slot="body" slot-scope="props">
            <div class="notification vue-notification" :class="props.item.type">
                <button class="delete" @click="props.close"></button>
                <strong class="notification-title">
                    {{props.item.title}}
                </strong>
                <div class="notification-content" v-html="props.item.text"></div>
            </div>
        </template>
    </notifications>

    <login v-if="!authenticated"></login>

    <template v-else>
        <cytomine-navbar></cytomine-navbar>

        <div id="bottom">
            <cytomine-sidebar></cytomine-sidebar>

            <div class="app-content">
                <!--
                Each image state is saved so that user can re-access its state later on
                QUESTION: allow to clean ? the cached component should be destroyed,
                but consequently the keep-alive does not work anymore (because destroyed object is
                still referenced)

                Should probably be handled in VueX
            -->

            <!-- <keep-alive include="cytomine-image"> -->
                <router-view v-if="currentUser" :key="$route.path"></router-view>
            <!-- </keep-alive> -->
            </div>
        </div>
    </template>
</div>
</template>

<script>
import { mapState } from "vuex";

import CytomineNavbar from "./components/layout/CytomineNavbar.vue";
import CytomineSidebar from "./components/layout/CytomineSidebar.vue";
import Login from "./components/Login.vue";

export default {
    name: "app",
    components: {CytomineNavbar, CytomineSidebar, Login},
    computed: mapState({
        currentUser: state => state.currentUser.user,
        authenticated: state => state.currentUser.authenticated
    }),
    created() {
        this.$store.dispatch("fetchUser").catch(() => {});
    }
};
</script>

<!-- <style lang="sass" src="bulma"></style> Alternative requiring an handling of sass -->
<style>
@import "~bulma/css/bulma.css";
@import "~bulma-slider/dist/css/bulma-slider.min.css";
@import "~font-awesome/css/font-awesome.min.css";
@import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600'); /* TODO: download */

@font-face {
    font-family: 'cytomine';
    src: url('assets/cytomine-font.woff') format('woff');
}

html, body {
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

body {
    font: 14px/1 'Open Sans', sans-serif;
    color: #333;
    background: #888;
}

.wrapper {
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;
    background: #333;
}

.notifications {
    margin-top: 10px;
}

#bottom {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
}

.app-content {
    flex: 1;
    background: #d4d4d4;
    overflow-y: auto;
    position: relative;
}

.app-content h1 {
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 16px;
    text-align: center;
    padding: 10px;
}

.app-content h2 {
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 15px;
}

h1.page-title {
    flex-shrink: 0;
    padding: 20px;
    font-size: 20px;
    margin-bottom: 20px;
}

.input[readonly] {
    background-color: whitesmoke;
}

.panel-heading {
    border-radius: 8px 8px 0px 0px;
}

.panel-block {
    background: #fff;
    display: block;
}

</style>
