import {Cytomine, Project, ProjectConnection, Ontology, AnnotationType} from 'cytomine-client';
import {fullName} from '@/utils/user-utils.js';
import {getAllTerms} from '@/utils/ontology-utils';

function getDefaultState() {
  return {
    project: null,
    configUI: {},
    ontology: null,
    managers: [],
    members: [],
    currentViewer: null
  };
}

export default {
  state: getDefaultState(),

  mutations: {
    logout(state) {
      Object.assign(state, getDefaultState());
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

    setMembers(state, members) {
      state.members = members;
    },

    setCurrentViewer(state, id) {
      state.currentViewer = id;
    }
  },

  actions: {
    async loadProject({state, dispatch, commit}, idProject) {
      let projectChange = !state.project || state.project.id !== idProject;
      let project = await Project.fetch(idProject);
      commit('setProject', project);
      commit(`projects/${project.id}/setProject`, project, {root: true});

      let promises = [
        dispatch('fetchUIConfig'),
        dispatch('fetchOntology'),
        dispatch('fetchProjectMembers')
      ];

      if(projectChange) {
        promises.push(new ProjectConnection({project: idProject}).save());
      }
      await Promise.all(promises);
    },

    async updateProject({state, dispatch, commit}, updatedProject) {
      let reloadOntology = state.project.ontology !== updatedProject.ontology;
      commit('setProject', updatedProject);
      commit(`projects/${updatedProject.id}/setProject`, updatedProject, {root: true});
      if(reloadOntology) {
        await dispatch('fetchOntology');
      }
    },

    async fetchUIConfig({state, commit}) {
      let config = await Cytomine.instance.fetchUIConfigCurrentUser(state.project.id);
      commit('setConfigUI', config);
    },

    async fetchProjectMembers({state, commit}) {
      let managersPromise = state.project.fetchAdministrators();
      let membersPromise = state.project.fetchUsers();

      let managers = (await managersPromise).array;
      let members = (await membersPromise).array;

      members.forEach(member => member.fullName = fullName(member));

      commit('setManagers', managers);
      commit('setMembers', members);
    },

    async fetchOntology({state, commit}) {
      let ontology = state.project.ontology ? await Ontology.fetch(state.project.ontology) : null;
      commit('setOntology', ontology);
    }
  },

  getters: {
    canEditLayer: (state, getters, rootState) => idLayer => {
      let currentUser = rootState.currentUser.user;
      let project = state.project;
      return getters.canManageProject || (!project.isReadOnly && (idLayer === currentUser.id || !project.isRestricted));
    },

    canEditAnnot: (_, getters, rootState) => annot => {
      let currentUser = rootState.currentUser.user;
      let idLayer = annot.user;
      if(annot.type === AnnotationType.REVIEWED) {
        return currentUser.adminByNow || annot.reviewUser === currentUser.id;
      }
      return getters.canEditLayer(idLayer);
    },

    canEditImage: (state, getters, rootState) => image => {
      let currentUser = rootState.currentUser.user;
      let project = state.project;
      return getters.canManageProject || (!project.isReadOnly && (image.user === currentUser.id || !project.isRestricted));
    },

    canManageProject: (state, _, rootState) => { // true iff current user is admin or project manager
      let currentUser = rootState.currentUser.user || {};
      return currentUser.adminByNow || state.managers.some(user => user.id === currentUser.id);
    },

    contributors: (state) => {
      let idsManagers = state.managers.map(user => user.id);
      return state.members.filter(user => !idsManagers.includes(user.id));
    },

    terms: (state) => {
      return state.ontology ? getAllTerms(state.ontology) : null;
    },

    currentViewer: (state, _, rootState) => {
      if(!state.project) {
        return null;
      }
      return rootState.projects[state.project.id].viewers[state.currentViewer];
    },

    currentViewerModule: (state) => {
      if(!state.project) {
        return null;
      }
      return `projects/${state.project.id}/viewers/${state.currentViewer}/`;
    }
  }
};
