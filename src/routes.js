import VueRouter from "vue-router";

// Import Components
import GlobalDashboard from "./components/GlobalDashboard.vue";
import ListProjects from "./components/project/ListProjects.vue";
import Account from "./components/Account.vue";
import CytomineImage from "./components/viewer/CytomineImage.vue";
import PageNotFound from "./components/PageNotFound.vue";

// Define routes
const routes = [
    {
        path: "/",
        component: GlobalDashboard, // Alternative: component: require("./components/GlobalDashboard.vue").default
        meta: {
            title: "Cytomine, your virtual microscope"
        }
    },
    {
        path: "/projects",
        component: ListProjects,
        meta: {
            title: "Cytomine - Projects"
        }
    },
    {
        path: "/account",
        component: Account,
        meta: {
            title: "Cytomine - Account"
        }
    },
    {
        path: "/image/:id",
        name: "image",
        component: CytomineImage,
        meta: {
            title: "Cytomine - Image"
        }
    },
    {
        path: "*",
        component: PageNotFound
    }
];

// Create router instance
const router = new VueRouter({
    routes: routes,
    linkActiveClass: "is-active"
});

router.beforeEach((to, from, next) => {
    if(to.meta.title) {
        document.title = to.meta.title;
    }
    else {
        document.title = "Cytomine";
    }
    next();
});

export default router;
