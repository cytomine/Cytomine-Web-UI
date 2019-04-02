import Vue from "vue";
import router from "@/routes.js";

import {Cytomine, ImageInstance, PropertyCollection, AbstractImage, AnnotationType, Term} from "cytomine-client";

import {isCluster, createColorStyle, createTextStyle, changeOpacity, selectStyles,
    verticesStyle, reviewedStyles, reviewedSelectStyles, defaultColors} from "@/utils/style-utils.js";
import constants from "@/utils/constants";

import {createGeoJsonFmt} from "vuelayers/lib/ol-ext/format";

let initialLayersOpacity = 0.5;
let initialTermsOpacity = 1;

export default {
    state: {
        viewers: {}
    },

    mutations: {

        logout(state) {
            state.viewers = {};
        },

        addViewer(state, {id, project}) {
            Vue.set(state.viewers, id, {
                maps: [],
                idProject: project.id,
                nameProject: project.name,
                blindProject: project.blindMode,
                links: [],
                imageSelector: false,
                activeMap: 0
            });
        },

        removeViewer(state, idViewer) {
            Vue.delete(state.viewers, idViewer);
        },

        setImageSelector(state, {idViewer, value}) {
            state.viewers[idViewer].imageSelector = value;
        },

        addMap(state, {idViewer, wrapper}) {
            let viewerWrapper = state.viewers[idViewer];
            viewerWrapper.maps.push(wrapper);
            viewerWrapper.imageSelector = false;
            viewerWrapper.activeMap = viewerWrapper.maps.length - 1;
        },

        removeMap(state, {idViewer, index}) {
            let viewerWrapper = state.viewers[idViewer];
            viewerWrapper.maps.splice(index, 1);
        },

        setActiveMap(state, {idViewer, index}) {
            state.viewers[idViewer].activeMap = index;
        },

        setImageInstance(state, {idViewer, index, image}) {
            let viewerWrapper = state.viewers[idViewer];
            viewerWrapper.maps[index].imageInstance = image;
        },

        togglePanel(state, {idViewer, index, panel}) {
            let imageWrapper = state.viewers[idViewer].maps[index];
            if(imageWrapper.activePanel === panel) {
                imageWrapper.activePanel = null;
            }
            else {
                imageWrapper.activePanel = panel;
            }
        },

        // ----- View links

        linkMaps(state, {idViewer, indexes}) {
            let links = state.viewers[idViewer].links;
            let groups = indexes.map(index => links.findIndex(group => group.includes(index)));

            if(groups[0] != -1) {
                if(groups[1] == -1) {
                    links[groups[0]].push(indexes[1]);
                }
                else if(groups[0] != groups[1]) { // merge the groups
                    links[groups[0]].push(...links[groups[1]]);
                    links.splice(groups[1], 1);
                }
            }
            else if(groups[1] != -1) {
                links[groups[1]].push(indexes[0]);
            }
            else { // create new group linking the maps
                links.push(indexes);
            }
        },

        unlinkMap(state, {idViewer, index, deletion=false}) {
            let links = state.viewers[idViewer].links;
            for(let i = links.length - 1; i >= 0; i--) {
                let group = links[i];
                for(let j = group.length - 1; j >= 0; j--) {
                    if(group[j] == index) {
                        group.splice(j, 1);
                        if(group.length == 1) { // if group no longer contains several maps, delete it
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

        setBroadcast(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].broadcast = value;
        },

        setTrackedUser(state, {idViewer, index, idUser}) {
            state.viewers[idViewer].maps[index].trackedUser = idUser;
        },

        // ----- View properties

        setCenter(state, {idViewer, index, center}) {
            let viewerWrapper = state.viewers[idViewer];
            let refImageWrapper = viewerWrapper.maps[index];
            let increments = refImageWrapper.center.map((val, i) => center[i] - val);
            let refZoom = refImageWrapper.imageInstance.depth - refImageWrapper.zoom;

            // find all indexes that should be updated (if map is not linked to other, update only it)
            let mapIndexesToUpdate = viewerWrapper.links.find(group => group.includes(index)) || [index];
            mapIndexesToUpdate.forEach(idx => {
                let imageWrapper = viewerWrapper.maps[idx];
                let diffZoom = imageWrapper.imageInstance.depth - imageWrapper.zoom - refZoom;
                let zoomFactor = Math.pow(2, diffZoom);
                viewerWrapper.maps[idx].center = viewerWrapper.maps[idx].center.map((val, i) => {
                    return val + increments[i]*zoomFactor;
                });
            });
        },

        setZoom(state, {idViewer, index, zoom}) {
            let viewerWrapper = state.viewers[idViewer];
            let zoomIncrement = zoom - viewerWrapper.maps[index].zoom;

            // find all indexes that should be updated (if map is not linked to other, update only it)
            let mapIndexesToUpdate = viewerWrapper.links.find(group => group.includes(index)) || [index];
            mapIndexesToUpdate.forEach(idx => {
                viewerWrapper.maps[idx].zoom += zoomIncrement;
            });
        },

        setRotation(state, {idViewer, index, rotation}) {
            let viewerWrapper = state.viewers[idViewer];
            let rotationInc = rotation - viewerWrapper.maps[index].rotation + 2*Math.PI;

            // find all indexes that should be updated (if map is not linked to other, update only it)
            let mapIndexesToUpdate = viewerWrapper.links.find(group => group.includes(index)) || [index];
            mapIndexesToUpdate.forEach(idx => {
                viewerWrapper.maps[idx].rotation = (viewerWrapper.maps[idx].rotation + rotationInc) % (2*Math.PI);
            });
        },

        // ----- Color manipulation

        setBrightness(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].brightness = value;
        },

        setContrast(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].contrast = value;
        },

        setHue(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].hue = value;
        },

        setSaturation(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].saturation = value;
        },

        resetColorManipulation(state, {idViewer, index}) {
            state.viewers[idViewer].maps[index].brightness = 0;
            state.viewers[idViewer].maps[index].contrast = 0;
            state.viewers[idViewer].maps[index].hue = 0;
            state.viewers[idViewer].maps[index].saturation = 0;
        },

        // ----- Digital zoom

        setMaxZoom(state, {idViewer, index, maxZoom}) {
            state.viewers[idViewer].maps[index].maxZoom = maxZoom;
        },

        setDigitalZoom(state, {idViewer, index, digitalZoom}) {
            state.viewers[idViewer].maps[index].digitalZoom = digitalZoom;
        },

        // ----- Terms

        addTerm(state, {idViewer, term}) { // if a term is added, required to add it to all images as they belong to same project
            let maps = state.viewers[idViewer].maps;
            maps.forEach(map => {
                map.terms.push(formatTerm(term, map.layersOpacity));
            });
        },

        setTerms(state, {idViewer, index, terms}) {
            state.viewers[idViewer].maps[index].terms = terms;
        },

        setTermsNewAnnots(state, {idViewer, index, terms}) {
            state.viewers[idViewer].maps[index].termsNewAnnots = terms;
        },

        filterTermsNewAnnots(state, {idViewer, index}) { // keep only the terms that still exist
            let wrapper = state.viewers[idViewer].maps[index];
            let idTerms = wrapper.terms.map(term => term.id);
            wrapper.termsNewAnnots = wrapper.termsNewAnnots.filter(id => idTerms.includes(id));
        },

        toggleTermVisibility(state, {idViewer, index, indexTerm}) {
            let wrapper = state.viewers[idViewer].maps[index];
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

        setDisplayNoTerm(state, {idViewer, index, value}) {
            let wrapper = state.viewers[idViewer].maps[index];
            wrapper.displayNoTerm = value;

            if(!value) { // unselect annotation if it is no longer displayed
                let selectedFeatures = wrapper.selectedFeatures;
                for(let index = selectedFeatures.length - 1; index >= 0; index--) {
                    let feature = selectedFeatures[index];
                    let annot = feature.properties.annot;

                    if(annot.term.length == 0) {
                        selectedFeatures.splice(index, 1);
                    }
                }
            }
        },

        setTermOpacity(state, {idViewer, index, indexTerm, opacity}) {
            let wrapper = state.viewers[idViewer].maps[index];
            let term = wrapper.terms[indexTerm];
            term.opacity = opacity;
            changeOpacity(term.olStyle, wrapper.layersOpacity*opacity);
        },

        setNoTermOpacity(state, {idViewer, index, opacity}) {
            let wrapper = state.viewers[idViewer].maps[index];
            wrapper.noTermOpacity = opacity;
            changeOpacity(wrapper.noTermStyle, wrapper.layersOpacity*opacity);
        },

        resetTermOpacities(state, {idViewer, index}) {
            let wrapper = state.viewers[idViewer].maps[index];
            wrapper.terms.forEach(term => {
                term.opacity = initialTermsOpacity;
                changeOpacity(term.olStyle, wrapper.layersOpacity*initialTermsOpacity);
            });
            wrapper.noTermOpacity = initialTermsOpacity;
            changeOpacity(wrapper.noTermStyle, wrapper.layersOpacity*wrapper.noTermOpacity);
        },

        // ----- Selected layers

        addLayer(state, {idViewer, index, layer, propValues}) {
            let wrapper = state.viewers[idViewer].maps[index];
            if(wrapper.selectedLayers == null) {
                wrapper.selectedLayers = [];
            }

            wrapper.selectedPropertyValues = {...wrapper.selectedPropertyValues, ...propValues};
            wrapper.selectedLayers.push({...layer});
        },

        removeLayer(state, {idViewer, index, indexLayer}) {
            let wrapper = state.viewers[idViewer].maps[index];
            wrapper.selectedLayers.splice(indexLayer, 1);
        },

        toggleLayerVisibility(state, {idViewer, index, indexLayer}) {
            let layer = state.viewers[idViewer].maps[index].selectedLayers[indexLayer];
            layer.visible = !layer.visible;
        },

        toggleLayerDrawOn(state, {idViewer, index, indexLayer}) {
            let layer = state.viewers[idViewer].maps[index].selectedLayers[indexLayer];
            layer.drawOn = !layer.drawOn;
        },

        setLayersOpacity(state, {idViewer, index, opacity}) {
            let wrapper = state.viewers[idViewer].maps[index];
            wrapper.layersOpacity = opacity;
            wrapper.terms.forEach(term => changeOpacity(term.olStyle, opacity*term.opacity));
            changeOpacity(wrapper.noTermStyle, opacity*wrapper.noTermOpacity);
            changeOpacity(wrapper.multipleTermsStyle, opacity);
            changeOpacity(wrapper.defaultStyle, opacity);
        },

        // ----- Properties

        setPropertiesKeys(state, {idViewer, index, keys}) {
            state.viewers[idViewer].maps[index].propertiesKeys = keys;
        },

        setSelectedPropertyKey(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].selectedPropertyKey = value;
        },

        setSelectedPropertyValues(state, {idViewer, index, properties}) {
            state.viewers[idViewer].maps[index].selectedPropertyValues = properties;
        },

        setSelectedPropertyColor(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].selectedPropertyColor = value;
        },

        // ----- Selected features

        setSelectedFeatures(state, {idViewer, index, selectedFeatures}) {
            state.viewers[idViewer].maps[index].selectedFeatures = selectedFeatures;
        },

        clearSelectedFeatures(state, {idViewer, index}) {
            let wrapper = state.viewers[idViewer].maps[index];
            wrapper.selectedFeatures = [];
            wrapper.annotsToSelect = [];
        },

        selectFeature(state, {idViewer, index, feature}) {
            state.viewers[idViewer].maps[index].selectedFeatures.push(createGeoJsonFmt().writeFeatureObject(feature));
        },

        changeAnnotSelectedFeature(state, {idViewer, index, indexFeature, annot}) {
            state.viewers[idViewer].maps[index].selectedFeatures[indexFeature].properties.annot = annot;
        },

        removeLayerFromSelectedFeatures(state, {idViewer, index, idLayer, cache=false}) {
            let wrapper = state.viewers[idViewer].maps[index];

            let selectedFeatures = wrapper.selectedFeatures;
            for(let index = selectedFeatures.length - 1; index >= 0; index--) {
                let feature = selectedFeatures[index];
                let annot = feature.properties.annot;
                if(annot.user == idLayer) {
                    selectedFeatures.splice(index, 1);
                    if(cache) {
                        wrapper.annotsToSelect.push(annot);
                    }
                }
            }

            if(!cache) {
                wrapper.annotsToSelect = wrapper.annotsToSelect.filter(annot => annot.user != idLayer);
            }
        },

        setAnnotToSelect(state, {idViewer, index, annot}) {
            state.viewers[idViewer].maps[index].annotsToSelect = [annot];
        },

        setShowComments(state, {idViewer, index, annot}) {
            state.viewers[idViewer].maps[index].showComments = annot ? annot.id : null;
        },

        // ----- Draw tools and associated interactions

        activateTool(state, {idViewer, index, tool}) {
            state.viewers[idViewer].maps[index].activeTool = tool;
        },

        activateEditTool(state, {idViewer, index, tool}) {
            state.viewers[idViewer].maps[index].activeEditTool = tool;
        },

        setOngoingEdit(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].ongoingEdit = value;
        },

        // ----- Calibration

        setResolution(state, {idViewer, idImage, resolution}) {
            state.viewers[idViewer].maps.forEach(({imageInstance}) => {
                if(imageInstance.id == idImage) {
                    imageInstance.resolution = resolution;
                }
            });
        },

        // ----- Annotation details

        setDisplayAnnotDetails(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].displayAnnotDetails = value;
        },

        setPositionAnnotDetails(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].positionAnnotDetails = value;
        },

        // ----- Undo/Redo

        resetActions(state, {idViewer, index}) {
            let wrapper = state.viewers[idViewer].maps[index];
            wrapper.actions = [];
            wrapper.undoneActions = [];
        },

        addAction(state, {idViewer, index, annot, type}) {
            let action = {annot, type, command: Cytomine.instance.lastCommand};
            let wrapper = state.viewers[idViewer].maps[index];
            wrapper.actions.push(action);
            wrapper.undoneActions = [];
        },

        undoAction(state, {idViewer, index, opposedAction}) {
            let wrapper = state.viewers[idViewer].maps[index];
            wrapper.actions.pop();
            wrapper.undoneActions.push(opposedAction);
        },

        redoAction(state, {idViewer, index, opposedAction}) {
            let wrapper = state.viewers[idViewer].maps[index];
            wrapper.undoneActions.pop();
            wrapper.actions.push(opposedAction);
        },


    },

    actions: {
        changePath({getters}, idViewer) {
            let idAnnotation = router.currentRoute.params.idAnnotation;
            let action = router.currentRoute.query.action;
            router.replace(getters.pathViewer({idViewer, idAnnotation, action}));
        },

        async addViewer({commit, dispatch, rootState}, {idViewer, idImages}) {
            commit("addViewer", {id: idViewer, project: rootState.project.project});
            await Promise.all(idImages.map(async id => {
                let image = await ImageInstance.fetch(id);
                dispatch("addMap", {idViewer, image});
            }));
        },

        async addMap({commit, dispatch, getters, rootState}, {idViewer, image}) {
            let [fetchedImage, propertiesKeys, projectProperties] = await Promise.all([
                fetchImage(image.id),
                fetchPropertiesKeys(image.id),
                PropertyCollection.fetchAll({object: rootState.project.project})
            ]);

            let terms = formatTerms(getters.terms, initialLayersOpacity);

            let selectedPropertyKey = null;
            let defaultPropertyProp = projectProperties.array.find(prop => prop.key === constants.DEFAULT_PROPERTY_KEY);
            if(defaultPropertyProp && propertiesKeys.includes(defaultPropertyProp.value)) {
                selectedPropertyKey = defaultPropertyProp.value;
            }

            let wrapper = {
                imageInstance: fetchedImage,

                maxZoom: image.depth + constants.DIGITAL_ZOOM_INCREMENT,
                digitalZoom: true,

                zoom: 0,
                center: [image.width/2, image.height/2],
                rotation: 0,

                broadcast: false,
                trackedUser: null,
        
                activePanel: null,

                selectedLayers: null,

                terms: terms,
                termsNewAnnots: [],
                displayNoTerm: true,
                noTermOpacity: initialTermsOpacity,

                propertiesKeys,
                selectedPropertyKey,
                selectedPropertyColor: defaultColors[0],
                selectedPropertyValues: {},

                defaultStyle: createColorStyle("#fff", initialLayersOpacity),
                noTermStyle: createColorStyle("#fff", initialLayersOpacity*initialTermsOpacity),
                multipleTermsStyle: createColorStyle("#fff", initialLayersOpacity),
                layersOpacity: initialLayersOpacity,

                selectedFeatures: [],
                annotsToSelect: [],
                showComments: null, // set to the identifier of an annotation to automatically open comments modal if this annotation if the first to be selected

                activeTool: "select",
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
            commit("addMap", {idViewer, wrapper});
            dispatch("changePath", idViewer);
        },

        async setImageInstance({commit, dispatch}, {idViewer, index, image}) {
            await fetchImageServers(image);
            commit("setImageInstance", {idViewer, index, image});
            commit("clearSelectedFeatures", {idViewer, index});
            commit("resetActions", {idViewer, index});
            await dispatch("refreshProperties", {idViewer, index});
            dispatch("changePath", idViewer);
        },

        async refreshData({state, commit, dispatch, getters}, idViewer) {
            await Promise.all(state.viewers[idViewer].maps.map(async (map, index) => {
                let [image] = await Promise.all([
                    fetchImage(map.imageInstance.id),
                    dispatch("refreshProperties", {idViewer, index})
                ]);

                let terms = formatTerms(getters.terms, map.opacity, map.terms);

                commit("setImageInstance", {idViewer, index, image});
                commit("setTerms", {idViewer, index, terms});
                commit("filterTermsNewAnnots", {idViewer, index});
            }));
            dispatch("changePath", idViewer);
        },

        removeMap({commit, dispatch}, {idViewer, index}) {
            commit("unlinkMap", {idViewer, index, deletion: true});
            commit("removeMap", {idViewer, index});
            dispatch("changePath", idViewer);
        },

        removeLayer({state, commit}, {idViewer, index, indexLayer, cacheSelectedFeatures}) {
            let idLayer = state.viewers[idViewer].maps[index].selectedLayers[indexLayer].id;
            commit("removeLayer", {idViewer, index, indexLayer});
            commit("removeLayerFromSelectedFeatures", {idViewer, index, idLayer, cache: cacheSelectedFeatures});
        },

        toggleLayerVisibility({state, commit}, {idViewer, index, indexLayer}) {
            commit("toggleLayerVisibility", {idViewer, index, indexLayer});
            let layer = state.viewers[idViewer].maps[index].selectedLayers[indexLayer];
            if(!layer.visible) {
                commit("removeLayerFromSelectedFeatures", {idViewer, index, idLayer: layer.id});
            }
        },

        activateTool({state, commit}, {idViewer, index, tool}) {
            if(state.viewers[idViewer].maps[index].activeTool == "select" && tool != "select") {
                commit("clearSelectedFeatures", {idViewer, index});
                commit("activateEditTool", {idViewer, index, tool: null});
            }
            commit("activateTool", {idViewer, index, tool});
        },

        selectFeature({commit}, {idViewer, index, feature}) {
            commit("clearSelectedFeatures", {idViewer, index});
            commit("selectFeature", {idViewer, index, feature});
        },

        async setSelectedPropertyKey({state, commit}, {idViewer, index, value}) {
            let wrapper = state.viewers[idViewer].maps[index];
            let idImage = wrapper.imageInstance.id;
            let properties = {};
            if(value != null && wrapper.selectedLayers) {
                for(let layer of wrapper.selectedLayers) {
                    let layerValues = await fetchLayerPropertiesValues(layer.id, idImage, value);
                    properties = {...properties, ...layerValues};
                }
            }

            commit("setSelectedPropertyValues", {idViewer, index, properties});
            commit("setSelectedPropertyKey", {idViewer, index, value});
        },

        async addLayer({state, commit}, {idViewer, index, layer}) {
            let wrapper = state.viewers[idViewer].maps[index];
            let idImage = wrapper.imageInstance.id;
            let key = wrapper.selectedPropertyKey;
            let propValues = {};
            if(key != null) {
                propValues = await fetchLayerPropertiesValues(layer.id, idImage, key);
            }
            commit("addLayer", {idViewer, index, layer, propValues});
        },

        async refreshProperties({state, commit, dispatch}, {idViewer, index}) {
            let wrapper = state.viewers[idViewer].maps[index];
            let idImage = wrapper.imageInstance.id;
            let keys = await fetchPropertiesKeys(idImage);
            commit("setPropertiesKeys", {idViewer, index, keys});

            let currentKey = wrapper.selectedPropertyKey;
            let newKey = keys.includes(currentKey) ? currentKey : null;
            dispatch("setSelectedPropertyKey", {idViewer, index, value: newKey});
        }
    },

    getters: {
        genStyleFunction: state => (idViewer, index) => (feature) => {
            let annot = feature.get("annot");
            if(annot == null) {
                return;
            }

            let imageWrapper = state.viewers[idViewer].maps[index];

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

            if(nbTerms == 1) {
                let wrappedTerm = imageWrapper.terms.find(term => term.id == annot.term[0]);
                if(!wrappedTerm.visible) {
                    return; // do not display annot
                }
                styles.push(wrappedTerm.olStyle);
            }
            else if(nbTerms > 1) {
                let hasTermsToDisplay = imageWrapper.terms.some(term => term.visible && annot.term.includes(term.id));
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
                if(imageWrapper.activeEditTool == "modify") {
                    styles.push(verticesStyle);
                }
            }
            else if(isReviewed) {
                styles.push(...reviewedStyles);
            }

            // Properties
            let propValue = imageWrapper.selectedPropertyValues[annot.id];
            if (propValue != null) {
                let color = imageWrapper.selectedPropertyColor;
                let fontSize = "34px";
                if(imageWrapper.zoom <= 3) {
                    fontSize = "12px";
                }
                else if(imageWrapper.zoom <= 6) {
                    fontSize = "19px";
                }
                else if(imageWrapper.zoom <= 8) {
                    fontSize = "26px";
                }
                styles.push(createTextStyle(propValue, fontSize, color.fill, null));
            }

            return styles;
        },

        pathViewer: state => ({idViewer, idAnnotation, action}) => {
            let viewerWrapper = state.viewers[idViewer];
            let imagesIds = viewerWrapper.maps.map(map => map.imageInstance.id);
            let annot = idAnnotation ? `/annotation/${idAnnotation}` : "";
            let actionStr = action ? "&action=" + action : "";
            return `/project/${viewerWrapper.idProject}/image/${imagesIds.join("-")}${annot}?viewer=${idViewer}${actionStr}`;
        }
    }
};

// Helper functions

async function fetchLayerPropertiesValues(idLayer, idImage, key) {
    let propertiesValues = await PropertyCollection.fetchPropertiesValuesAndPositions(
        idLayer,
        idImage,
        key
    );

    let properties = {};
    propertiesValues.forEach(propVal => {
        if(properties[propVal.idAnnotation] == null) {
            properties[propVal.idAnnotation] = propVal.value;
        }
        else {
            properties[propVal.idAnnotation] += "; " + propVal.value;
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
    if(image.imageServerURLs == null) {
        image.imageServerURLs = await new AbstractImage({id: image.baseImage}).fetchImageServers();
    }
}

async function fetchPropertiesKeys(idImage) {
    let data = await PropertyCollection.fetchKeysAnnotationProperties(null, idImage);
    return data;
}

function formatTerms(terms, layersOpacity, previousTerms=[]) {
    let result = [];
    let nbTerms = terms.length;
    for(let i = 0; i < nbTerms; i++) {
        let term = terms[i];
        let prevTerm = previousTerms.find(prevTerm => prevTerm.id == term.id);
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
