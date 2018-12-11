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
            <router-link to="/projects" class="navbar-item">
                <i class="fas fa-list-alt"></i>
                {{ $t("projects") }}
            </router-link>
            <router-link to="/storage" class="navbar-item">
                <i class="fas fa-download"></i>
                {{ $t("storage") }}
            </router-link>
        </div>

        <div class="navbar-end">
            <cytomine-searcher></cytomine-searcher>

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
</template>

<script>
import { mapState } from "vuex";

import NavbarDropdown from "./NavbarDropdown.vue";
import CytomineSearcher from "@/components/search/CytomineSearcher.vue";

import {fullName} from "@/utils/user-utils.js";

export default {
    name: "cytomine-navbar",
    components: {
        NavbarDropdown,
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
            ]
        };
    },
    computed: {
        currentLanguage() {
            return this.$i18n.locale;
        },
        currentUserFullInfo() {
            return fullName(this.currentUser);
        },
        ...mapState({currentUser: state => state.currentUser.user})
    },
    methods: {
        changeLanguage(newLocale) {
            this.$i18n.locale = newLocale;
            this.$moment.locale(newLocale);
        },
        async logout() {
            try {
                await this.$store.dispatch("logout");
            }
            catch(err) {
                this.$notify({type: "error", text: "Error during logout"}); // TODO: add translation
            }
        }
    }
};
</script>

<style>

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

#logo {
    height: 35px;
}

.navbar {
    font-weight: 600;
}

.navbar-item.logo {
    font-family: "cytomine";
    font-size: 2em;
    font-weight: lighter;
}

.navbar .fas {
    padding-right: 7px;
}

.navbar-item.language {
    font-size: 13px;
    font-weight: normal;
}

.navbar-item.language.selected {
    font-weight: 600;
}
</style>
