import {Cytomine, Project} from "cytomine-client";

export default {
    state: {
        project: null,
        configUI: {},
        managers: [],
        contributors: []
    },

    mutations: {
        setProject(state, project) {
            state.project = project;
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
        }
    },

    getters: {
        canEditLayer: (state, _, rootState) => idLayer => {
            let currentUser = rootState.currentUser.user;
            if(state.managers.some(user => user.id == currentUser.id)) { // user is manager
                return true;
            }

            let project = state.project;
            return !project.isReadOnly && (idLayer == currentUser.id || !project.isRestricted);
        }
    }
};
