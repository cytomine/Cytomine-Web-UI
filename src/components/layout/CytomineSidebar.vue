<!-- Source sidebar: https://codepen.io/oknoblich/pen/klnjw -->

<template>
<div class="sidebar-wrapper">
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
                    {{ $t("images") }}
                </a>
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
</div>
</template>

<script>
export default {
    name: "cytomine-sidebar",
    data() {
        return {
            visibleSideBar: true,
        };
    }
};
</script>

<style scoped>
.sidebar-wrapper {
    display: flex;
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
</style>
