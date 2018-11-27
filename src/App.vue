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

    <template v-if="!loading">
        <div class="panel communication-error-panel" v-if="communicationError">
            <p class="panel-heading">
                {{$t("communication-error")}}
            </p>
            <div class="panel-block">
                {{$t("core-cannot-be-reached")}}
            </div>
        </div>

        <login v-else-if="!authenticated"></login>

        <template v-else>
            <cytomine-navbar></cytomine-navbar>
            <div class="bottom">
                <router-view v-if="currentUser"></router-view>
            </div>
        </template>
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
    data() {
        return {
            communicationError: false,
            loading: true
        };
    },
    computed: mapState({
        currentUser: state => state.currentUser.user,
        authenticated: state => state.currentUser.authenticated
    }),
    async created() {
        try {
            await this.$store.dispatch("fetchUser");
        }
        catch(err) {
            this.communicationError = true;
        }
        this.loading = false;
    }
};
</script>

<!-- <style lang="sass" src="bulma"></style> Alternative requiring an handling of sass -->
<style>
@import "~bulma/css/bulma.css";
@import "~bulma-slider/dist/css/bulma-slider.min.css";
@import "~font-awesome/css/font-awesome.min.css";
@import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600'); /* TODO: download */

@import "~quill/dist/quill.core.css";
@import "~quill/dist/quill.snow.css";

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
    line-height: unset;
}

.wrapper {
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;
    background: #d4d4d4;
}

.communication-error-panel {
    width: 30%;
    margin: auto;
    margin-top: 50px;
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

.modal {
    z-index: 2000;
}

.modal-background {
    background-color: rgba(10, 10, 10, 0.7);
}

.modal-card {
    max-height: 80vh;
}

.modal .modal-card-head {
    padding: 15px !important;
}

.modal .modal-card-title {
    font-size: 1.2rem !important;
    font-weight: normal !important;
}

.modal .modal-card-body {
    line-height: 1.5;
}

.modal .modal-card-foot {
    padding: 10px !important;
    justify-content: flex-end;
}

.modal .modal-card-foot button {
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

/* Loading */
.loading-overlay .loading-icon::after {
    width: 5em;
    height: 5em;
    border-left-color: #bbb;
    border-bottom-color: #bbb;
}

.loading-overlay.small .loading-icon::after {
    width: 2em;
    height: 2em;
    border-left-color: #bbb;
    border-bottom-color: #bbb;
}

/* V-Tooltip */
.v-popover {
    display: inline-block;
}

.v-popover .trigger {
    outline: 0;
}

.tooltip::after {
    display: none;
}

.tooltip .wrapper {
    display: block;
    background: none;
}

.tooltip {
  display: block !important;
  z-index: 1000;
}

.tooltip .tooltip-inner {
  background: white;
  border-radius: 20px;
  padding: 5px 10px 4px;
  box-shadow: 0 0 3px hsla(0,0%,4%,.1),0 0 0 1px hsla(0,0%,4%,.1);
  border-radius: 5px;
  font-size: 13px;
  max-width: 50vw; /* TODO: special design for mobile ; modal? */
  min-height: 50px;
  min-width: 50px;
}

.tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: hsla(0,0%,4%,.25);
  z-index: 1;
  border-width: 8px;
}

.tooltip .tooltip-arrow::after {
    border-width: 7px;
    border-style: solid;
    content: "";
    position: absolute;
}

.tooltip[x-placement^="top"] {
  margin-bottom: 8px;
}

.tooltip[x-placement^="top"] .tooltip-arrow {
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  bottom: -16px;
  left: calc(50% - 8px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="top"] .tooltip-arrow::after {
    border-color: white transparent transparent transparent;
    left:-7px;
    bottom: -6px;
}

.tooltip[x-placement^="bottom"] {
  margin-top: 8px;
}

.tooltip[x-placement^="bottom"] .tooltip-arrow {
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -16px;
  left: calc(50% - 8px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="bottom"] .tooltip-arrow::after {
    border-color: transparent transparent white transparent;
    left:-7px;
    top: -6px;
}

.tooltip[x-placement^="right"] {
  margin-left: 8px;
}

.tooltip[x-placement^="right"] .tooltip-arrow {
  border-left-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
  left: -16px;
  top: calc(50% - 8px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[x-placement^="right"] .tooltip-arrow::after {
    border-color: transparent white transparent transparent;
    bottom:-7px;
    left: -6px;
}

.tooltip[x-placement^="left"] {
  margin-right: 8px;
}

.tooltip[x-placement^="left"] .tooltip-arrow {
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  right: -16px;
  top: calc(50% - 8px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[x-placement^="left"] .tooltip-arrow::after {
    border-color: transparent transparent transparent white;
    bottom:-7px;
    right: -6px;
}

.tooltip[aria-hidden='true'] {
  visibility: hidden;
  opacity: 0;
  transition: opacity .15s, visibility .15s;
}

.tooltip[aria-hidden='false'] {
  visibility: visible;
  opacity: 1;
  transition: opacity .15s;
}

</style>
