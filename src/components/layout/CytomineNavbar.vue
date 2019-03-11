<template>
<nav class="navbar is-light" role="navigation">
    <div class="navbar-brand">
        <router-link to="/" exact class="navbar-item">
            <img src="@/assets/logo.svg" id="logo" alt="Cytomine">
        </router-link>
        <a role="" class="navbar-burger" :class="{'is-active':openedTopMenu}" @click="openedTopMenu=!openedTopMenu">
            <span></span> <span></span> <span></span>
        </a>
    </div>
    <div id="topMenu" class="navbar-menu" :class="{'is-active':openedTopMenu}">
        <div class="navbar-start">
            <navbar-dropdown icon="fa-eye" iconPack="far" v-if="this.nbViewers > 0" :title="$t('viewers')">
                <navigation-tree></navigation-tree>
            </navbar-dropdown>
            <router-link to="/projects" class="navbar-item">
                <i class="fas fa-list-alt"></i>
                {{ $t("projects") }}
            </router-link>
            <router-link v-if="!currentUser.guestByNow" to="/storage" class="navbar-item">
                <i class="fas fa-download"></i>
                {{ $t("storage") }}
            </router-link>
            <router-link to="/ontology" class="navbar-item">
                <i class="fas fa-hashtag"></i>
                {{ $t("ontologies") }}
            </router-link>
            <router-link v-if="currentUser.adminByNow" to="/admin" class="navbar-item">
                <i class="fas fa-wrench"></i>
                {{ $t("admin") }}
            </router-link>
        </div>

        <div class="navbar-end">
            <cytomine-searcher></cytomine-searcher>

            <navbar-dropdown :icon="currentUser.adminByNow ? 'fa-star' : 'fa-user'"
                             :title="currentUserFullInfo"
                             :tag="currentUser.adminByNow ? {type: 'is-danger', text: $t('admin')} : null"
                             :listPathes="['/account']">
                <router-link to="/account" class="navbar-item">
                    {{$t("account")}}
                </router-link>
                <template v-if="currentUser.admin">
                    <a v-if="!currentUser.adminByNow" class="navbar-item" @click="openAdminSession()">
                        {{$t("open-admin-session")}}
                    </a>
                    <a v-else class="navbar-item" @click="closeAdminSession()">
                        {{$t("close-admin-session")}}
                    </a>
                </template>
                <a class="navbar-item" @click="logout()">
                    {{ $t("logout") }}
                </a>
            </navbar-dropdown>

            <navbar-dropdown icon="fa-question-circle" :title="$t('help')">
                <a class="navbar-item" @click="hotkeysModal = true">{{$t("hotkeys")}}</a>
                <a class="navbar-item" @click="aboutModal = true">{{$t("about-cytomine")}}</a>
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

    <hotkeys-modal :active.sync="hotkeysModal"></hotkeys-modal>
    <about-cytomine-modal :active.sync="aboutModal"></about-cytomine-modal>
</nav>
</template>

<script>
import { mapState } from "vuex";

import NavbarDropdown from "./NavbarDropdown";
import NavigationTree from "./NavigationTree";
import HotkeysModal from "./HotkeysModal";
import AboutCytomineModal from "./AboutCytomineModal";
import CytomineSearcher from "@/components/search/CytomineSearcher";

import {fullName} from "@/utils/user-utils.js";

export default {
    name: "cytomine-navbar",
    components: {
        NavbarDropdown,
        NavigationTree,
        HotkeysModal,
        AboutCytomineModal,
        CytomineSearcher
    },
    data() {
        return {
            openedTopMenu: false,
            openedLanguagePanel: false,
            visibleSideBar: true,
            languages: [
                {value: "en", name:"English"},
                {value: "fr", name:"Français"}
            ],
            hotkeysModal: false,
            aboutModal: false
        };
    },
    computed: {
        currentLanguage() {
            return this.$i18n.locale;
        },
        currentUserFullInfo() {
            return fullName(this.currentUser);
        },
        nbViewers() {
            return Object.keys(this.$store.state.images.viewers).length;
        },
        ...mapState({currentUser: state => state.currentUser.user})
    },
    methods: {
        changeLanguage(newLocale) {
            this.$i18n.locale = newLocale;
            this.$moment.locale(newLocale);
        },
        async openAdminSession() {
            try {
                await this.$store.dispatch("openAdminSession");
                this.$router.go();
            }
            catch(error) {
                console.log(error);
            }
        },
        async closeAdminSession() {
            try {
                await this.$store.dispatch("closeAdminSession");
                this.$router.go();
            }
            catch(error) {
                console.log(error);
            }
        },
        async logout() {
            try {
                await this.$store.dispatch("logout");
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-logout")});
            }
        }
    }
};
</script>

<style lang="scss">
#logo {
    height: 35px;
    font-family: "cytomine";
    font-size: 2em;
    font-weight: lighter;
    line-height: 1em;
}

.navbar {
    font-weight: 600;
    z-index: 500 !important;
    
    .fas, .far {
        padding-right: 7px;
    }
}

.navbar-item.language {
    font-size: 13px;
    font-weight: normal;

    &.selected {
        font-weight: 600;
    }
}

</style>
