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
        <div class="bottom">
            <router-view v-if="currentUser"></router-view>
        </div>
    </template>
</div>
</template>

<script>
import { mapState } from "vuex";

import CytomineNavbar from "./components/layout/CytomineNavbar.vue";
import Login from "./components/Login.vue";

export default {
    name: "app",
    components: {CytomineNavbar, Login},
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
    background: #d4d4d4;
}

.wrapper {
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;
    background: #d4d4d4;
}

.notifications {
    margin-top: 10px;
}

.bottom {
    flex: 1;
    overflow-y: auto;
    position: relative;
}

h1 {
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 16px;
    text-align: center;
    padding: 10px;
}

h2 {
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

.in-project {
    color: grey;
    font-size: 11px;
    margin-left: 5px;
}

.input[readonly] {
    background-color: whitesmoke;
}

/* Panel */

.panel-heading {
    border-radius: 8px 8px 0px 0px;
}

.panel-block {
    background: #fff;
    display: block;
}

/* Modal */

.modal-background {
    background-color: rgba(10, 10, 10, 0.7);
}

.dialog.modal .modal-card-head {
    padding: 15px !important;
}

.dialog.modal .modal-card-title {
    font-size: 1.2rem !important;
    font-weight: normal !important;
}

.dialog.modal .modal-card-body {
    line-height: 1.5;
}

.dialog.modal .modal-card-foot {
    padding: 10px !important;
}

.dialog.modal .modal-card-foot button {
    font-size: 14px;
    font-weight: normal !important;
}

/* Filters */

.filters {
    background: #f8f8f8;
    margin-top: 20px;
    border-radius: 10px;
    padding: 20px;
}

.filter-label {
    text-transform: uppercase;
    font-size: 12px;
    margin-bottom: 5px;
    margin-left: 15px;
}

</style>
