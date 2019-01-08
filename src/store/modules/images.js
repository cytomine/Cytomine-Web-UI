import Vue from "vue";

import {ImageInstance, TermCollection, PropertyCollection, AbstractImage} from "cytomine-client";

import {isCluster, createColorStyle, createDefaultStroke, createTextStyle, changeOpacity, selectStyles,
    verticesStyle, highlightStyles, defaultColors} from "@/utils/style-utils.js";
import constants from "@/utils/constants";

import {createGeoJsonFmt} from "vuelayers/lib/ol-ext/format";

export default {
    state: {
        viewers: {}
    },

    mutations: {

        addViewer(state, {id, name, idProject}) {
            Vue.set(state.viewers, id, {
                maps: [],
                name,
                idProject,
                links: [],
                imageSelector: false
            });
        },

        removeViewer(state, idViewer) {
            Vue.delete(state.viewers, idViewer);
        },

        setImageSelector(state, {idViewer, value}) {
            state.viewers[idViewer].imageSelector = value;
        },

        addMap(state, {idViewer, wrapper}) {
            state.viewers[idViewer].maps.push(wrapper);
            state.viewers[idViewer].imageSelector = false;
        },

        removeMap(state, {idViewer, index}) {
            state.viewers[idViewer].maps.splice(index, 1);
        },

        setImageInstance(state, {idViewer, index, image}) {
            state.viewers[idViewer].maps[index].imageInstance = image;
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

        setTerms(state, {idViewer, index, terms}) {
            state.viewers[idViewer].maps[index].terms = terms;
        },

        toggleAssociateTermToNewAnnot(state, {idViewer, index, indexTerm}) {
            let wrapper = state.viewers[idViewer].maps[index];
            let term = wrapper.terms[indexTerm];
            term.associateToNewAnnot = !term.associateToNewAnnot;
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
            wrapper.terms.forEach(term => changeOpacity(term.olStyle, opacity));
            changeOpacity(wrapper.defaultStyle, opacity);
            let colorStroke = wrapper.defaultStroke.getColor();
            colorStroke[3] = opacity;
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

        // ----- Highlighted features

        setHighlightedFeaturesIds(state, {idViewer, index, ids}) {
            state.viewers[idViewer].maps[index].highlightedFeaturesIds = ids;
        },

        // ----- Draw tools and associated interactions

        activateTool(state, {idViewer, index, tool}) {
            state.viewers[idViewer].maps[index].activeTool = tool;
        },

        activateEditTool(state, {idViewer, index, tool}) {
            state.viewers[idViewer].maps[index].activeEditTool = tool;
        },

        // ----- Calibration

        setOngoingCalibration(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].ongoingCalibration = value;
        },

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

        resetActions(state, {idViewer, index}) { // TODO: remove when annotations corrections are correctly handled
            let wrapper = state.viewers[idViewer].maps[index];
            wrapper.actions = [];
            wrapper.undoneActions = [];
        },

        addAction(state, {idViewer, index, annot, oldAnnot}) {
            let action = {annot, oldAnnot};
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
        async addViewer({commit, dispatch}, baseImage) {
            let idViewer = baseImage.id;
            commit("addViewer", {id: idViewer, name: baseImage.instanceFilename, idProject: baseImage.project});
            await dispatch("addMap", {idViewer, image: baseImage});
        },

        async addMap({commit}, {idViewer, image}) {
            let initialOpacity = 0.5;
            let defaultStroke = createDefaultStroke(initialOpacity);

            let [fetchedImage, terms, propertiesKeys] = await Promise.all([
                fetchImage(image.id),
                fetchTerms(image.project, defaultStroke, initialOpacity),
                fetchPropertiesKeys(image.id)
            ]);

            let wrapper = {
                imageInstance: fetchedImage,

                maxZoom: image.depth + constants.DIGITAL_ZOOM_INCREMENT,
                digitalZoom: true,

                zoom: 0, // TODO
                center: [image.width/2, image.height/2],
                rotation: 0,

                broadcast: false,
                trackedUser: null,
        
                activePanel: null,

                selectedLayers: null,

                terms: terms,
                displayNoTerm: true,

                propertiesKeys,
                selectedPropertyKey: null, // TODO: allow to select default property (https://github.com/cytomine/Cytomine-core/issues/1142)
                selectedPropertyColor: defaultColors[0],
                selectedPropertyValues: {},

                defaultStroke,
                defaultStyle: createColorStyle("#fff", defaultStroke, initialOpacity),
                layersOpacity: initialOpacity,

                selectedFeatures: [],
                annotsToSelect: [],

                highlightedFeaturesIds: [],

                activeTool: "select",
                activeEditTool: null,

                brightness: 0,
                contrast: 0,
                hue: 0,
                saturation: 0,

                displayAnnotDetails: true,
                positionAnnotDetails: {x: 0, y: 0},

                actions: [],
                undoneActions: [],

                ongoingCalibration: false
            };
            commit("addMap", {idViewer, wrapper});
        },

        async refreshData({state, commit, dispatch}, idViewer) {
            await Promise.all(state.viewers[idViewer].maps.map(async (map, index) => {
                let [image, terms] = await Promise.all([
                    fetchImage(map.imageInstance.id),
                    fetchTerms(map.imageInstance.project, map.defaultStroke, map.opacity, map.terms),
                    dispatch("refreshProperties", {idViewer, index})
                ]);

                commit("setImageInstance", {idViewer, index, image});
                commit("setTerms", {idViewer, index, terms});
            }));
        },

        removeMap({commit}, {idViewer, index}) {
            commit("unlinkMap", {idViewer, index, deletion: true});
            commit("removeMap", {idViewer, index});
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

        startCalibration({dispatch, commit}, {idViewer, index}) {
            dispatch("activateTool", {idViewer, index, tool: "line"});
            commit("setOngoingCalibration", {idViewer, index, value: true});
        },

        endCalibration({state, commit}, {idViewer, index, resolution}) {
            let idImage = state.viewers[idViewer].maps[index].imageInstance.id;
            commit("setResolution", {idViewer, idImage, resolution});
            commit("setOngoingCalibration", {idViewer, index, value: false});
        },

        cancelCalibration({commit}, {idViewer, index}) {
            commit("activateTool", {idViewer, index, tool: "select"});
            commit("setOngoingCalibration", {idViewer, index, value: false});
        },

        selectFeature({commit}, {idViewer, index, feature}) {
            commit("clearSelectedFeatures", {idViewer, index});
            commit("selectFeature", {idViewer, index, feature});
        },

        async setSelectedPropertyKey({state, commit}, {idViewer, index, value}) {
            let wrapper = state.viewers[idViewer].maps[index];
            let idImage = wrapper.imageInstance.id;
            let properties = {};
            if(value != null) {
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

            let cluster = isCluster(feature);

            // QUESTION: decide whether it is better to filter with this method, or to force source refresh and query only appropriate annotations
            // QUESTION: what to do with clusters (returned count does not take into account the selected terms) ?
            // Possible solutions:
            // 1. in backend, for clusters, send array with composition of cluster (x for term 1, y for term 2, z for term1-2)
            // 2. force source refresh every time the list of terms to display is updated
            // 3. add parameter allowing to provide the terms to take into account in kmeans (but only for kmeans)
            if(!cluster) {
                let hasTerms = (annot.term.length > 0);
                let hasTermsToDisplay = imageWrapper.terms.some(term => term.visible && annot.term.includes(term.id));

                if((hasTerms && !hasTermsToDisplay) || (!hasTerms && !imageWrapper.displayNoTerm)) {
                    return null; // do not display annotation
                }
            }

            let styles = [];

            // Style based on term
            if(annot.term.length == 1) {
                let termToFind = annot.term[0];
                styles.push(imageWrapper.terms.find(term => term.id == termToFind).olStyle);
            }
            else {
                styles.push(imageWrapper.defaultStyle);
            }

            // Style for clusters
            if(cluster) {
                styles.push(createTextStyle(annot.count.toString()));
            }

            // Styles for selected elements
            if(imageWrapper.selectedFeatures.map(ftr => ftr.id).includes(feature.getId())) {
                styles.push(...selectStyles);

                // if in modify mode, display vertices
                if(imageWrapper.activeEditTool == "modify") {
                    styles.push(verticesStyle);
                }
            }
            else if(imageWrapper.highlightedFeaturesIds.includes(feature.getId())) {
                styles.push(...highlightStyles);
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
    if(image.imageServerURLs == null) {
        let imageServerURLs = await new AbstractImage({id: image.baseImage}).fetchImageServers();
        image.imageServerURL = imageServerURLs[0];
    }
    return image;
}

async function fetchPropertiesKeys(idImage) {
    let data = await PropertyCollection.fetchKeysAnnotationProperties(null, idImage);
    return data;
}

async function fetchTerms(idProject, stroke, opacity, previousTerms=[]) {
    // TODO: fetch in another store module since common to all images of the project?
    let terms = (await TermCollection.fetchAll({filterKey: "project", filterValue: idProject})).array;

    let nbTerms = terms.length;
    for(let i = 0; i < nbTerms; i++) {
        let term = terms[i];
        let prevTerm = previousTerms.find(prevTerm => prevTerm.id == term.id);
        if(prevTerm != null) {
            terms[i] = prevTerm;
        }
        else {
            term.olStyle = createColorStyle(term.color, stroke, opacity);
            term.visible = true;
            term.associateToNewAnnot = false;
        }
    }
    return terms;
}
