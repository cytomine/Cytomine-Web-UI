import {Cytomine, Project, Ontology} from "cytomine-client";

export default {
    state: {
        project: null,
        configUI: {},
        ontology: null,
        managers: [],
        contributors: []
    },

    mutations: {
        logout(state) {
            state.project = null;
            state.configUI = {};
            state.managers = [];
            state.contributors = [];
        },

        setProject(state, project) {
            state.project = project;
        },

        setOntology(state, ontology) {
            state.ontology = ontology;
        },

        setConfigUI(state, config) {
            state.configUI = config;
        },

        setManagers(state, managers) {
            state.managers = managers;
        },

        setContributors(state, contributors) {
            state.contributors = contributors;
        },
    },

    actions: {
        async loadProject({dispatch, commit}, idProject) {
            let project = await Project.fetch(idProject);
            commit("setProject", project);

            await Promise.all([
                dispatch("fetchUIConfig"),
                dispatch("fetchOntology"),
                dispatch("fetchProjectMembers"),
                project.recordUserConnection()
            ]);
        },

        async fetchUIConfig({state, commit}) {
            let config = await Cytomine.instance.fetchUIConfigCurrentUser(state.project.id);
            commit("setConfigUI", config);
        },

        async fetchProjectMembers({state, commit}) {
            let managersPromise = state.project.fetchAdministrators();
            let membersPromise = state.project.fetchUsers();

            let managers = (await managersPromise).array;
            let members = (await membersPromise).array;

            let idsManagers = managers.map(user => user.id);
            let contributors = members.filter(user => !idsManagers.includes(user.id));

            commit("setManagers", managers);
            commit("setContributors", contributors);
        },

        async fetchOntology({state, commit}) {
            let ontology = await Ontology.fetch(state.project.ontology);
            commit("setOntology", ontology);
        }
    },

    getters: {
        canEditLayer: (state, _, rootState) => idLayer => {
            let currentUser = rootState.currentUser.user;
            if(currentUser.adminByNow || state.managers.some(user => user.id == currentUser.id)) { // user admin or manager
                return true;
            }

            let project = state.project;
            return !project.isReadOnly && (idLayer == currentUser.id || !project.isRestricted);
        }
    }
};
