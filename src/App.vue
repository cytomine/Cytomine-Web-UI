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
            <nav class="navbar is-light" role="navigation">
                <div class="navbar-brand">
                    <router-link to="/" exact class="navbar-item">
                        <img src="./assets/logo-35-coop.png" alt="Cytomine">
                    </router-link>
                    <a role="" class="navbar-burger" :class="{'is-active':openedTopMenu}" @click="openedTopMenu=!openedTopMenu">
                        <span></span> <span></span> <span></span>
                    </a>
                </div>
                <div id="topMenu" class="navbar-menu" :class="{'is-active':openedTopMenu}">
                    <div class="navbar-start">
                        <router-link to="/projects" class="navbar-item">
                            <i class="fa fa-list-alt"></i>
                            {{ $t("projects") }}
                        </router-link>
                        <router-link to="/storage" class="navbar-item">
                            <i class="fa fa-download"></i>
                            {{ $t("storage") }}
                        </router-link>
                    </div>

                    <div class="navbar-end">
                        <navbar-dropdown icon="fa-question-circle" :title="$t('help')">
                            <a href="#" class="navbar-item">{{$t("hotkeys")}}</a>
                            <a href="#" class="navbar-item">{{$t("about")}}</a>
                        </navbar-dropdown>

                        <navbar-dropdown icon="fa-user" :title="currentUserFullInfo" :listPathes="['/account']">
                            <router-link to="/account" class="navbar-item">
                                {{$t("account")}}
                            </router-link>
                            <a class="navbar-item" @click="logout()">
                                {{ $t("logout") }}
                            </a>
                        </navbar-dropdown>

                        <navbar-dropdown :title="currentLanguage" :classes="['is-right']">
                            <a v-for="lang in languages"
                            class="navbar-item language" :class="{selected: (lang.value == currentLanguage)}"
                            :key="lang.value"
                            @click="changeLanguage(lang.value)">
                            {{ lang.name }}
                        </a>
                    </navbar-dropdown>
                </div>
            </div>
        </nav>

        <div id="bottom">
            <!-- Source sidebar: https://codepen.io/oknoblich/pen/klnjw -->
            <nav class="sidebar large" v-show="visibleSideBar">
                <div class="title-nav">
                    <h1>{{ $t("project") }}</h1>
                    Test_Telemis_TMA
                </div>
                <ul>
                    <router-link tag="li" to="/project-dashboard">
                        <a>
                            <i class="fa fa-dashboard"></i>
                            {{ $t("dashboard") }}
                        </a>
                    </router-link>
                    <router-link tag="li" to="/images">
                        <a>
                            <i class="fa fa-image"></i>
                            {{ $t("images") }}</a>
                        </router-link>
                        <router-link tag="li" to="/annotations">
                            <a>
                                <i class="fa fa-pencil-square-o"></i>
                                {{ $t("annotations") }}
                            </a>
                        </router-link>
                        <router-link tag="li" to="/jobs">
                            <a>
                                <i class="fa fa-tasks"></i>
                                {{ $t("jobs") }}
                            </a>
                        </router-link>
                        <router-link tag="li" to="/activity">
                            <a>
                                <i class="fa fa-bar-chart"></i>
                                {{ $t("activity") }}
                            </a>
                        </router-link>
                        <router-link tag="li" to="/parameters">
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
                <div class="app-content">
                    <!--
                    Each image state is saved so that user can re-access its state later on
                    QUESTION: allow to clean ? the cached component should be destroyed,
                    but consequently the keep-alive does not work anymore (because destroyed object is
                    still referenced)

                    Should probably be handled in VueX
                -->

                <keep-alive include="CytomineImage">
                    <router-view v-if="currentUser" :key="$route.path"></router-view>
                </keep-alive>
            </div>
        </div>
    </template>
</div>
</template>

<script>
import { mapState } from "vuex";
import NavbarDropdown from "./components/utils/NavbarDropdown.vue";
import Login from "./components/Login.vue";

export default {
    name: "app",
    components: {NavbarDropdown, Login},
    data() {
        return {
            openedTopMenu: false,
            openedLanguagePanel: false,
            visibleSideBar: true,
            languages: [
                {value: "en", name:"English"},
                {value: "fr", name:"Français"}
            ]
        };
    },
    computed: {
        currentLanguage() {
            return this.$i18n.locale;
        },
        currentUserFullInfo() {
            if(this.currentUser == null) {
                return "";
            }
            else {
                return `${this.currentUser.firstname} ${this.currentUser.lastname} (${this.currentUser.username})`;
            }
        },
        ...mapState(["currentUser", "authenticated"])
    },
    methods: {
        changeLanguage(newLanguage) {
            this.$i18n.locale = newLanguage;
        },
        async logout() {
            try {
                await this.$store.dispatch("logout");
            }
            catch(err) {
                this.$notify({type: "error", text: "Error during logout"}); // TODO: add translation
            }
        }
    },
    created() {
        this.$store.dispatch("fetchUser").catch(() => {});
    }
}
</script>

<!-- <style lang="sass" src="bulma"></style> Alternative requiring an handling of sass -->
<style>
@import "~bulma/css/bulma.css";
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

/*nav.navbar {
height: 50px;
color: white;
flex-shrink: 0;
border-bottom: 1px solid #111;
background: #444;
padding-left: 20px;
display: flex;
align-items: center;
}

.cytomine {
font-family: "cytomine";
font-size: 2em;
font-weight: lighter;
}*/

.navbar {
    font-weight: bold;
}

.navbar-item.logo {
    font-family: "cytomine";
    font-size: 2em;
    font-weight: lighter;
}

.navbar .fa {
    padding-right: 7px;
}

.navbar-item.language {
    font-size: 13px;
    font-weight: normal;
}

.navbar-item.language.selected {
    font-weight: bold;
}

#bottom {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
}

.sidebar {
    width: 220px;
}

.sidebar ul {
    padding: 0;
    margin: 0;
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
    letter-spacing: 5px;
    padding: 10px;
    text-transform: uppercase;
    letter-spacing: 5px;
    font-size: 16px;
    text-align: center;
    padding: 10px;
    font-weight: bold;
}

.sidebar li a {
    position: relative;
    display: block;
    padding: 20px;
    font-size: 14px;
    font-weight: bold;
    color: #eee;
    border-bottom: 1px solid #222;
    text-decoration: none;
}

.sidebar.large li a {
    text-align: center;
}

.sidebar:not(.large) .fa {
    font-size: 16px;
    margin-right: 12px;
}

.sidebar.large .fa {
    display: block;
    font-size: 3vh;
    margin-bottom: 10px;
}

.sidebar li a:hover, .sidebar li.is-active a {
    background: #444;
}

.sidebar li:nth-child(1).is-active a { box-shadow: inset 5px 0 0 #bb5454, inset 6px 0 0 #222; }
.sidebar li:nth-child(2).is-active a { box-shadow: inset 5px 0 0 #bba154, inset 6px 0 0 #222; }
.sidebar li:nth-child(3).is-active a { box-shadow: inset 5px 0 0 #55bb55, inset 6px 0 0 #222; }
.sidebar li:nth-child(4).is-active a { box-shadow: inset 5px 0 0 #54a1bb, inset 6px 0 0 #222; }
.sidebar li:nth-child(5).is-active a { box-shadow: inset 5px 0 0 #6d54bb, inset 6px 0 0 #222; }
.sidebar li:nth-child(6).is-active a { box-shadow: inset 5px 0 0 #b3b3b3, inset 6px 0 0 #222; }

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

.app-content {
    flex: 1;
    background: #d4d4d4;
    word-break: break-all;
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

.notifications {
    margin-top: 10px;
    /*position: absolute;
    margin-left: auto;
    margin-right: auto;
    width: 300px;
    z-index: 1000;*/
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
