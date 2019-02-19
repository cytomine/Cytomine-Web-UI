import VueRouter from "vue-router";

// Import Components
import GlobalDashboard from "./components/GlobalDashboard.vue";
import ListProjects from "./components/project/ListProjects.vue";
import CytomineStorage from "./components/storage/CytomineStorage.vue";
import ListOntologies from "./components/ontology/ListOntologies.vue";
import ListImages from "./components/image/ListImages.vue";
import ImageInformation from "./components/image/ImageInformation.vue";
import ListAnnotations from "./components/annotations/ListAnnotations.vue";
import ProjectInformation from "./components/project/ProjectInformation.vue";
import ProjectConfiguration from "./components/project/ProjectConfiguration.vue";
import Account from "./components/user/Account.vue";
import AdvancedSearch from "./components/search/AdvancedSearch.vue";
import CytomineViewer from "./components/viewer/CytomineViewer.vue";
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
        path: "/storage",
        component: CytomineStorage,
        meta: {
            title: "Cytomine - Storage"
        }
    },
    {
        path: "/ontology/:idOntology?",
        component: ListOntologies
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
                path: "image/:idImages",
                component: CytomineViewer
            },
            {
                path: "image/:idImage/information",
                component: ImageInformation
            },
            {
                path: "image/:idImages/annotation/:idAnnotation",
                component: CytomineViewer
            },
            {
                path: "annotations",
                component: ListAnnotations
            },
            {
                path: "information",
                component: ProjectInformation
            },
            {
                path: "configuration",
                component: ProjectConfiguration
            },
            {
                path: "*",
                component: PageNotFound
            }
        ]
    },

    // redirections for old URLS
    {path: "/userdashboard", redirect: "/"},
    {path: "/project", redirect: "/projects"},
    {path: "/explorer", redirect: "/"},
    {path: "/upload", redirect: "/storage"},

    {path: "/activity", redirect: "/"},
    {path: "/activity-:idProject-", redirect: "/"}, // TODO
    {path: "/activity-:idProject-:idUser", redirect: "/"}, // TODO

    {path: "/search-", redirect: "/advanced-search"},

    {path: "/admin", redirect: "/"}, // TODO
    {path: "/admin-tabs-dashboard", redirect: "/"}, // TODO
    {path: "/admin-tabs-users", redirect: "/"}, // TODO
    {path: "/admin-tabs-groups", redirect: "/"}, // TODO
    {path: "/admin-tabs-permissions", redirect: "/"}, // TODO
    {path: "/admin-tabs-configuration", redirect: "/"}, // TODO

    {path: "/tabs-dashboard-:idProject", redirect: "/project/:idProject/information"},
    {path: "/tabs-images-:idProject", redirect: "/project/:idProject/images"},
    {path: "/tabs-annotations-:idProject", redirect: "/project/:idProject/annotations"},
    {path: "/tabs-annotationproperties-:idProject-:idAnnot", redirect: "/project/:idProject"},
    {path: "/tabs-imageproperties-:idProject-:idImage", redirect: "/project/:idProject"},
    {path: "/tabs-imageproperties-:idProject-:idImage", redirect: "/project/:idProject"},
    {path: "/tabs-algos-:idProject", redirect: "/"}, // TODO
    {path: "/tabs-config-:idProject", redirect: "/project/:idProject/configuration"},
    {path: "/tabs-usersconfig-:idProject", redirect: {path: "/project/:idProject/configuration", query: {tab: "members"}}},
    {path: "/tabs-image-:idProject-:idImage-0", redirect: "/project/:idProject/image/:idImage"},
    {path: "/tabs-image-:idProject-:idImage-:idAnnotation", redirect: "/project/:idProject/image/:idImage/annotation/:idAnnotation"},
    // -----

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
