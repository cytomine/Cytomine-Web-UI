import router from '@/routes.js';

import {Cytomine, ImageInstance, PropertyCollection, AbstractImage, AnnotationType, Term} from 'cytomine-client';

import {isCluster, createColorStyle, createTextStyle, changeOpacity, selectStyles,
  verticesStyle, reviewedStyles, reviewedSelectStyles, defaultColors} from '@/utils/style-utils.js';
import constants from '@/utils/constants';

import {createGeoJsonFmt} from 'vuelayers/lib/ol-ext/format';

let initialLayersOpacity = 0.5;
let initialTermsOpacity = 1;

export default {
  namespaced: true,

  state() {
    return {
      id: null,
      maps: [],
      links: [],
      imageSelector: false,
      activeMap: 0
    };
  },

  mutations: {

    setId(state, id) {
      state.id = id;
    },

    setImageSelector(state, value) {
      state.imageSelector = value;
    },

    addMap(state, wrapper) {
      state.maps.push(wrapper);
      state.imageSelector = false;
      state.activeMap = state.maps.length - 1;
    },

    removeMap(state, index) {
      state.maps.splice(index, 1);
    },

    setActiveMap(state, index) {
      state.activeMap = index;
    },

    setImageInstance(state, {index, image}) {
      state.maps[index].imageInstance = image;
    },

    togglePanel(state, {index, panel}) {
      let imageWrapper = state.maps[index];
      if(imageWrapper.activePanel === panel) {
        imageWrapper.activePanel = null;
      }
      else {
        imageWrapper.activePanel = panel;
      }
    },

    // ----- View links

    linkMaps(state, indexes) {
      let links = state.links;
      let groups = indexes.map(index => links.findIndex(group => group.includes(index))); // find to which link group (if any) each map belongs

      if(groups[0] !== -1) { // if first map belongs to a link group
        if(groups[1] === -1) {
          links[groups[0]].push(indexes[1]);
        }
        else if(groups[0] !== groups[1]) { // merge the groups
          links[groups[0]].push(...links[groups[1]]);
          links.splice(groups[1], 1);
        }
      }
      else if(groups[1] !== -1) { // if second map belongs to a link group
        links[groups[1]].push(indexes[0]);
      }
      else { // create new group linking the maps
        links.push(indexes);
      }
    },

    unlinkMap(state, {index, deletion=false}) {
      let links = state.links;
      for(let i = links.length - 1; i >= 0; i--) {
        let group = links[i];
        for(let j = group.length - 1; j >= 0; j--) {
          if(group[j] === index) { // found the group of the map to unlink
            group.splice(j, 1);
            if(group.length === 1) { // if group no longer contains several maps, delete it
              links.splice(i, 1);
              break;
            }
          }

          if(deletion && group[j] > index) { // if a map is about to be deleted, higher indexes should be updated
            group[j] = group[j] - 1;
          }
        }
      }
    },

    // ----- Tracking

    setBroadcast(state, {index, value}) {
      state.maps[index].broadcast = value;
    },

    setTrackedUser(state, {index, idUser}) {
      state.maps[index].trackedUser = idUser;
    },

    // ----- View properties

    setCenter(state, {index, center}) {
      let refImageWrapper = state.maps[index];
      let increments = refImageWrapper.center.map((val, i) => center[i] - val);
      let refZoom = refImageWrapper.imageInstance.depth - refImageWrapper.zoom;

      // find all indexes that should be updated (if map is not linked to other, update only it)
      let mapIndexesToUpdate = state.links.find(group => group.includes(index)) || [index];
      mapIndexesToUpdate.forEach(idx => {
        let imageWrapper = state.maps[idx];
        let diffZoom = imageWrapper.imageInstance.depth - imageWrapper.zoom - refZoom;
        let zoomFactor = Math.pow(2, diffZoom);
        state.maps[idx].center = state.maps[idx].center.map((val, i) => {
          return val + increments[i]*zoomFactor;
        });
      });
    },

    setZoom(state, {index, zoom}) {
      let zoomIncrement = zoom - state.maps[index].zoom;

      // find all indexes that should be updated (if map is not linked to other, update only it)
      let mapIndexesToUpdate = state.links.find(group => group.includes(index)) || [index];
      mapIndexesToUpdate.forEach(idx => {
        state.maps[idx].zoom += zoomIncrement;
      });
    },

    setRotation(state, {index, rotation}) {
      let rotationInc = rotation - state.maps[index].rotation + 2*Math.PI;

      // find all indexes that should be updated (if map is not linked to other, update only it)
      let mapIndexesToUpdate = state.links.find(group => group.includes(index)) || [index];
      mapIndexesToUpdate.forEach(idx => {
        state.maps[idx].rotation = (state.maps[idx].rotation + rotationInc) % (2*Math.PI);
      });
    },

    // ----- Color manipulation

    setBrightness(state, {index, value}) {
      state.maps[index].brightness = value;
    },

    setContrast(state, {index, value}) {
      state.maps[index].contrast = value;
    },

    setHue(state, {index, value}) {
      state.maps[index].hue = value;
    },

    setSaturation(state, {index, value}) {
      state.maps[index].saturation = value;
    },

    resetColorManipulation(state, {index}) {
      state.maps[index].brightness = 0;
      state.maps[index].contrast = 0;
      state.maps[index].hue = 0;
      state.maps[index].saturation = 0;
    },

    // ----- Digital zoom

    setMaxZoom(state, {index, maxZoom}) {
      state.maps[index].maxZoom = maxZoom;
    },

    setDigitalZoom(state, {index, digitalZoom}) {
      state.maps[index].digitalZoom = digitalZoom;
    },

    // ----- Terms

    addTerm(state, term) { // if a term is added, required to add it to all images as they belong to same project
      let maps = state.maps;
      maps.forEach(map => {
        map.terms.push(formatTerm(term, map.layersOpacity));
      });
    },

    setTerms(state, {index, terms}) {
      state.maps[index].terms = terms;
    },

    setTermsNewAnnots(state, {index, terms}) {
      state.maps[index].termsNewAnnots = terms;
    },

    filterTermsNewAnnots(state, {index}) { // keep only the terms that still exist
      let wrapper = state.maps[index];
      let terms = wrapper.terms || [];
      let idTerms = terms.map(term => term.id);
      wrapper.termsNewAnnots = wrapper.termsNewAnnots.filter(id => idTerms.includes(id));
    },

    toggleTermVisibility(state, {index, indexTerm}) {
      let wrapper = state.maps[index];
      let term = wrapper.terms[indexTerm];
      term.visible = !term.visible;

      if(!term.visible) { // unselect annotation if it is no longer displayed
        let selectedFeatures = wrapper.selectedFeatures;
        for(let index = selectedFeatures.length - 1; index >= 0; index--) {

          let feature = selectedFeatures[index];
          let annot = feature.properties.annot;

          if(!annot.term.includes(term.id)) {
            return;
          }

          let hasTermsToDisplay = wrapper.terms.some(term => term.visible && annot.term.includes(term.id));
          if(!hasTermsToDisplay) {
            selectedFeatures.splice(index, 1);
          }
        }
      }
    },

    setDisplayNoTerm(state, {index, value}) {
      let wrapper = state.maps[index];
      wrapper.displayNoTerm = value;

      if(!value) { // unselect annotation if it is no longer displayed
        let selectedFeatures = wrapper.selectedFeatures;
        for(let index = selectedFeatures.length - 1; index >= 0; index--) {
          let feature = selectedFeatures[index];
          let annot = feature.properties.annot;

          if(annot.term.length === 0) {
            selectedFeatures.splice(index, 1);
          }
        }
      }
    },

    setTermOpacity(state, {index, indexTerm, opacity}) {
      let wrapper = state.maps[index];
      let term = wrapper.terms[indexTerm];
      term.opacity = opacity;
      changeOpacity(term.olStyle, wrapper.layersOpacity*opacity);
    },

    setNoTermOpacity(state, {index, opacity}) {
      let wrapper = state.maps[index];
      wrapper.noTermOpacity = opacity;
      changeOpacity(wrapper.noTermStyle, wrapper.layersOpacity*opacity);
    },

    resetTermOpacities(state, index) {
      let wrapper = state.maps[index];
      wrapper.terms.forEach(term => {
        term.opacity = initialTermsOpacity;
        changeOpacity(term.olStyle, wrapper.layersOpacity*initialTermsOpacity);
      });
      wrapper.noTermOpacity = initialTermsOpacity;
      changeOpacity(wrapper.noTermStyle, wrapper.layersOpacity*wrapper.noTermOpacity);
    },

    // ----- Selected layers

    addLayer(state, {index, layer, propValues}) {
      let wrapper = state.maps[index];
      if(!wrapper.selectedLayers) {
        wrapper.selectedLayers = [];
      }

      wrapper.selectedPropertyValues = {...wrapper.selectedPropertyValues, ...propValues};
      wrapper.selectedLayers.push({...layer});
    },

    removeLayer(state, {index, indexLayer}) {
      let wrapper = state.maps[index];
      wrapper.selectedLayers.splice(indexLayer, 1);
    },

    toggleLayerVisibility(state, {index, indexLayer}) {
      let layer = state.maps[index].selectedLayers[indexLayer];
      layer.visible = !layer.visible;
    },

    toggleLayerDrawOn(state, {index, indexLayer}) {
      let layer = state.maps[index].selectedLayers[indexLayer];
      layer.drawOn = !layer.drawOn;
    },

    setLayersOpacity(state, {index, opacity}) {
      let wrapper = state.maps[index];
      wrapper.layersOpacity = opacity;
      if(wrapper.terms) {
        wrapper.terms.forEach(term => changeOpacity(term.olStyle, opacity*term.opacity));
      }
      changeOpacity(wrapper.noTermStyle, opacity*wrapper.noTermOpacity);
      changeOpacity(wrapper.multipleTermsStyle, opacity);
      changeOpacity(wrapper.defaultStyle, opacity);
    },

    // ----- Properties

    setPropertiesKeys(state, {index, keys}) {
      state.maps[index].propertiesKeys = keys;
    },

    setSelectedPropertyKey(state, {index, value}) {
      state.maps[index].selectedPropertyKey = value;
    },

    setSelectedPropertyValues(state, {index, properties}) {
      state.maps[index].selectedPropertyValues = properties;
    },

    setSelectedPropertyColor(state, {index, value}) {
      state.maps[index].selectedPropertyColor = value;
    },

    // ----- Selected features

    setSelectedFeatures(state, {index, selectedFeatures}) {
      state.maps[index].selectedFeatures = selectedFeatures;
    },

    clearSelectedFeatures(state, index) {
      let wrapper = state.maps[index];
      wrapper.selectedFeatures = [];
      wrapper.annotsToSelect = [];
    },

    selectFeature(state, {index, feature}) {
      state.maps[index].selectedFeatures.push(createGeoJsonFmt().writeFeatureObject(feature));
    },

    changeAnnotSelectedFeature(state, {index, indexFeature, annot}) {
      state.maps[index].selectedFeatures[indexFeature].properties.annot = annot;
    },

    removeLayerFromSelectedFeatures(state, {index, idLayer, cache=false}) {
      let wrapper = state.maps[index];

      let selectedFeatures = wrapper.selectedFeatures;
      for(let index = selectedFeatures.length - 1; index >= 0; index--) {
        let feature = selectedFeatures[index];
        let annot = feature.properties.annot;
        if(annot.user === idLayer) {
          selectedFeatures.splice(index, 1);
          if(cache) {
            wrapper.annotsToSelect.push(annot);
          }
        }
      }

      if(!cache) {
        wrapper.annotsToSelect = wrapper.annotsToSelect.filter(annot => annot.user !== idLayer);
      }
    },

    setAnnotToSelect(state, {index, annot}) {
      state.maps[index].annotsToSelect = [annot];
    },

    setShowComments(state, {index, annot}) {
      state.maps[index].showComments = annot ? annot.id : null;
    },

    // ----- Draw tools and associated interactions

    activateTool(state, {index, tool}) {
      state.maps[index].activeTool = tool;
    },

    activateEditTool(state, {index, tool}) {
      state.maps[index].activeEditTool = tool;
    },

    setOngoingEdit(state, {index, value}) {
      state.maps[index].ongoingEdit = value;
    },

    // ----- Calibration

    setResolution(state, {idImage, resolution}) {
      // change the resolution for all instances of the affected image in the viewer
      state.maps.forEach(({imageInstance}) => {
        if(imageInstance.id === idImage) {
          imageInstance.resolution = resolution;
        }
      });
    },

    // ----- Annotation details

    setDisplayAnnotDetails(state, {index, value}) {
      state.maps[index].displayAnnotDetails = value;
    },

    setPositionAnnotDetails(state, {index, value}) {
      state.maps[index].positionAnnotDetails = value;
    },

    // ----- Undo/Redo

    resetActions(state, index) {
      let wrapper = state.maps[index];
      wrapper.actions = [];
      wrapper.undoneActions = [];
    },

    addAction(state, {index, annot, type}) {
      let action = {annot, type, command: Cytomine.instance.lastCommand};
      let wrapper = state.maps[index];
      wrapper.actions.push(action);
      wrapper.undoneActions = [];
    },

    undoAction(state, {index, opposedAction}) {
      let wrapper = state.maps[index];
      wrapper.actions.pop();
      wrapper.undoneActions.push(opposedAction);
    },

    redoAction(state, {index, opposedAction}) {
      let wrapper = state.maps[index];
      wrapper.undoneActions.pop();
      wrapper.actions.push(opposedAction);
    },


  },

  actions: {
    changePath({getters}) {
      let idAnnotation = router.currentRoute.params.idAnnotation;
      let action = router.currentRoute.query.action;
      router.replace(getters.pathViewer({idAnnotation, action}));
    },

    async addMap({commit, dispatch, rootGetters, rootState}, image) {
      let [fetchedImage, propertiesKeys, projectProperties] = await Promise.all([
        fetchImage(image.id),
        fetchPropertiesKeys(image.id),
        PropertyCollection.fetchAll({object: rootState.currentProject.project})
      ]);

      let terms = formatTerms(rootGetters.terms, initialLayersOpacity);

      let selectedPropertyKey = null;
      let defaultPropertyProp = projectProperties.array.find(prop => prop.key === constants.DEFAULT_PROPERTY_KEY);
      if(defaultPropertyProp && propertiesKeys.includes(defaultPropertyProp.value)) {
        selectedPropertyKey = defaultPropertyProp.value;
      }

      let wrapper = {
        imageInstance: fetchedImage,

        maxZoom: image.depth + constants.DIGITAL_ZOOM_INCREMENT,
        digitalZoom: true,

        zoom: null, // will be initialized to appropriate value (depending on container size) in CytomineImage
        center: [image.width/2, image.height/2],
        rotation: 0,

        broadcast: false,
        trackedUser: null,

        activePanel: null,

        selectedLayers: null,

        terms,
        termsNewAnnots: [],
        displayNoTerm: true,
        noTermOpacity: initialTermsOpacity,

        propertiesKeys,
        selectedPropertyKey,
        selectedPropertyColor: defaultColors[0],
        selectedPropertyValues: {},

        defaultStyle: createColorStyle('#fff', initialLayersOpacity),
        noTermStyle: createColorStyle('#fff', initialLayersOpacity*initialTermsOpacity),
        multipleTermsStyle: createColorStyle('#fff', initialLayersOpacity),
        layersOpacity: initialLayersOpacity,

        selectedFeatures: [],
        annotsToSelect: [],
        showComments: null, // set to the identifier of an annotation to automatically open comments modal if this annotation if the first to be selected

        activeTool: 'select',
        activeEditTool: null,
        ongoingEdit: false,

        brightness: 0,
        contrast: 0,
        hue: 0,
        saturation: 0,

        displayAnnotDetails: true,
        positionAnnotDetails: {x: 0, y: 0},

        actions: [],
        undoneActions: []
      };
      commit('addMap', wrapper);
      dispatch('changePath');
    },

    async setImageInstance({commit, dispatch}, {index, image}) {
      await fetchImageServers(image);
      commit('setImageInstance', {index, image});
      commit('clearSelectedFeatures', index);
      commit('resetActions', index);
      await dispatch('refreshProperties', index);
      dispatch('changePath');
    },

    async refreshData({state, commit, dispatch, rootGetters}) {
      await Promise.all(state.maps.map(async (map, index) => {
        let [image] = await Promise.all([
          fetchImage(map.imageInstance.id),
          dispatch('refreshProperties', index)
        ]);
        let terms = formatTerms(rootGetters.terms, map.layersOpacity, map.terms);

        commit('setImageInstance', {index, image});
        commit('setTerms', {index, terms});
        commit('filterTermsNewAnnots', {index});
      }));
      dispatch('changePath');
    },

    removeMap({commit, dispatch}, index) {
      commit('unlinkMap', {index, deletion: true});
      commit('removeMap', index);
      dispatch('changePath');
    },

    removeLayer({state, commit}, {index, indexLayer, cacheSelectedFeatures}) {
      let idLayer = state.maps[index].selectedLayers[indexLayer].id;
      commit('removeLayer', {index, indexLayer});
      commit('removeLayerFromSelectedFeatures', {index, idLayer, cache: cacheSelectedFeatures});
    },

    toggleLayerVisibility({state, commit}, {index, indexLayer}) {
      commit('toggleLayerVisibility', {index, indexLayer});
      let layer = state.maps[index].selectedLayers[indexLayer];
      if(!layer.visible) {
        commit('removeLayerFromSelectedFeatures', {index, idLayer: layer.id});
      }
    },

    activateTool({state, commit}, {index, tool}) {
      let previousTool = state.maps[index].activeTool;
      if(previousTool === 'select' && tool !== 'select') {
        commit('clearSelectedFeatures', index);
        commit('activateEditTool', {index, tool: null});
      }
      commit('activateTool', {index, tool});
    },

    selectFeature({commit}, {index, feature}) {
      commit('clearSelectedFeatures', index);
      commit('selectFeature', {index, feature});
    },

    async setSelectedPropertyKey({state, commit}, {index, value}) {
      let wrapper = state.maps[index];
      let idImage = wrapper.imageInstance.id;
      let properties = {};
      if(value && wrapper.selectedLayers) {
        for(let layer of wrapper.selectedLayers) {
          let layerValues = await fetchLayerPropertiesValues(layer.id, idImage, value);
          properties = {...properties, ...layerValues};
        }
      }

      commit('setSelectedPropertyValues', {index, properties});
      commit('setSelectedPropertyKey', {index, value});
    },

    async addLayer({state, commit}, {index, layer}) {
      let wrapper = state.maps[index];
      let idImage = wrapper.imageInstance.id;
      let key = wrapper.selectedPropertyKey;
      let propValues = {};
      if(key) {
        propValues = await fetchLayerPropertiesValues(layer.id, idImage, key);
      }
      commit('addLayer', {index, layer, propValues});
    },

    async refreshProperties({state, commit, dispatch}, index) {
      let wrapper = state.maps[index];
      let idImage = wrapper.imageInstance.id;
      let keys = await fetchPropertiesKeys(idImage);
      commit('setPropertiesKeys', {index, keys});

      let currentKey = wrapper.selectedPropertyKey;
      let newKey = keys.includes(currentKey) ? currentKey : null;
      dispatch('setSelectedPropertyKey', {index, value: newKey});
    }
  },

  getters: {
    genStyleFunction: state => (index) => (feature) => {
      let annot = feature.get('annot');
      if(!annot) {
        return;
      }

      let imageWrapper = state.maps[index];

      // QUESTION: what to do with clusters (returned count does not take into account the selected terms) ?
      // Possible solutions:
      // 1. in backend, for clusters, send array with composition of cluster (x for term 1, y for term 2, z for term1-2)
      // 2. force source refresh every time the list of terms to display is updated
      // 3. add parameter allowing to provide the terms to take into account in kmeans (but only for kmeans)
      if(isCluster(feature)) {
        return [imageWrapper.defaultStyle, createTextStyle(annot.count.toString())];
      }

      let styles = [];

      let nbTerms = annot.term.length;
      let terms = imageWrapper.terms;

      if(terms && nbTerms === 1) {
        let wrappedTerm = terms.find(term => term.id === annot.term[0]);
        if(wrappedTerm) {
          if(!wrappedTerm.visible) {
            return; // do not display annot
          }
          styles.push(wrappedTerm.olStyle);
        }
        else {
          styles.push(imageWrapper.noTermStyle); // could not find term => display no term style
        }
      }
      else if(terms && nbTerms > 1) {
        let hasTermsToDisplay = terms.some(term => term.visible && annot.term.includes(term.id));
        if(!hasTermsToDisplay) {
          return; // do not display
        }
        styles.push(imageWrapper.multipleTermsStyle);
      }
      else {
        if(!imageWrapper.displayNoTerm) {
          return; // do not display annot
        }
        styles.push(imageWrapper.noTermStyle);
      }

      let isReviewed = annot.type === AnnotationType.REVIEWED;

      // Styles for selected elements
      if(imageWrapper.selectedFeatures.map(ftr => ftr.id).includes(feature.getId())) {
        styles.push(...isReviewed ? reviewedSelectStyles : selectStyles);

        // if in modify mode, display vertices
        if(imageWrapper.activeEditTool === 'modify') {
          styles.push(verticesStyle);
        }
      }
      else if(isReviewed) {
        styles.push(...reviewedStyles);
      }

      // Properties
      let propValue = imageWrapper.selectedPropertyValues[annot.id];
      if (propValue) {
        let color = imageWrapper.selectedPropertyColor;
        let fontSize = '34px';
        if(imageWrapper.zoom <= 3) {
          fontSize = '12px';
        }
        else if(imageWrapper.zoom <= 6) {
          fontSize = '19px';
        }
        else if(imageWrapper.zoom <= 8) {
          fontSize = '26px';
        }
        styles.push(createTextStyle(propValue, fontSize, color.fill, null));
      }

      return styles;
    },

    pathViewer: state => ({idAnnotation, action}={}) => {
      let idProject = state.maps[0].imageInstance.project;
      let imagesIds = state.maps.map(map => map.imageInstance.id);
      let annot = idAnnotation ? `/annotation/${idAnnotation}` : '';
      let actionStr = action ? '&action=' + action : '';
      return `/project/${idProject}/image/${imagesIds.join('-')}${annot}?viewer=${state.id}${actionStr}`;
    }
  }
};

// Helper functions

async function fetchLayerPropertiesValues(idLayer, idImage, key) {
  if(idLayer === -1) {
    return []; // currently not possible to retrieve properties of review layer (TODO in core)
  }

  let propertiesValues = await PropertyCollection.fetchPropertiesValuesAndPositions(
    idLayer,
    idImage,
    key
  );

    // if several properties with target key for an annotation, concatenate their values
  let properties = {};
  propertiesValues.forEach(propVal => {
    if(!properties[propVal.idAnnotation]) {
      properties[propVal.idAnnotation] = propVal.value;
    }
    else {
      properties[propVal.idAnnotation] += '; ' + propVal.value;
    }
  });

  return properties;
}

async function fetchImage(idImage) {
  let image = await ImageInstance.fetch(idImage);
  await fetchImageServers(image);
  return image;
}

async function fetchImageServers(image) {
  if(!image.imageServerURLs) {
    image.imageServerURLs = await new AbstractImage({id: image.baseImage}).fetchImageServers();
  }
}

async function fetchPropertiesKeys(idImage) {
  let data = await PropertyCollection.fetchKeysAnnotationProperties(null, idImage);
  return data;
}

function formatTerms(terms, layersOpacity, previousTerms=[]) {
  if(!terms) {
    return;
  }

  let result = [];
  let nbTerms = terms.length;
  for(let i = 0; i < nbTerms; i++) {
    let term = terms[i];
    let prevTerm = previousTerms.find(prevTerm => prevTerm.id === term.id);
    result.push(prevTerm ? prevTerm : formatTerm(term, layersOpacity));
  }
  return result;
}

function formatTerm(term, layersOpacity) {
  let result = new Term(term);
  result.opacity = initialTermsOpacity;
  result.olStyle = createColorStyle(term.color, initialTermsOpacity*layersOpacity);
  result.visible = true;
  return result;
}
