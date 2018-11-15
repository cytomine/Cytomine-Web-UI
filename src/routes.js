import VueRouter from "vue-router";

// Import Components
import GlobalDashboard from "./components/GlobalDashboard.vue";
import ListProjects from "./components/project/ListProjects.vue";
import ListImages from "./components/images/ListImages.vue";
import ListAnnotations from "./components/annotations/ListAnnotations.vue";
import Account from "./components/Account.vue";
import AdvancedSearch from "./components/AdvancedSearch.vue";
import CytomineImage from "./components/viewer/CytomineImage.vue";
import CytomineProject from "./components/project/CytomineProject.vue";
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
        path: "/advanced-search/:searchString?",
        component: AdvancedSearch
    },
    {
        path: "/account",
        component: Account,
        meta: {
            title: "Cytomine - Account"
        }
    },
    {
        path: "/project/:idProject",
        component: CytomineProject,
        meta: {
            title: "Cytomine - Project"
        },
        children: [
            {
                path: "",
                redirect: "images"
            },
            {
                path: "images",
                component: ListImages
            },
            {
                path: "image/:idImage",
                component: CytomineImage
            },
            {
                path: "image/:idImage/annotation/:idAnnotation",
                component: CytomineImage
            },
            {
                path: "annotations",
                component: ListAnnotations
            },
            {
                path: "*",
                component: PageNotFound
            }
        ]
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
