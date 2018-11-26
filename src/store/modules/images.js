import Vue from "vue";

import {TermCollection, PropertyCollection, AbstractImage} from "cytomine-client";

import {isCluster, createColorStyle, createDefaultStroke, createTextStyle, changeOpacity, selectStyles,
    verticesStyle, defaultColors} from "@/utils/style-utils.js";
import constants from "@/utils/constants";

import {createGeoJsonFmt} from "vuelayers/lib/ol-ext/format";

export default {
    state: {
        triggerMapUpdateSize: [], // change of this property should trigger a size update of all visible maps
        viewers: {}
    },

    mutations: {

        // --- Mutations common to all viewers

        triggerMapUpdateSize(state) {
            state.triggerMapUpdateSize = []; // new array will be considered as a new value
        },

        // --- Viewer-specific mutations

        addViewer(state, {id, name, idProject}) {
            Vue.set(state.viewers, id, {
                maps: [],
                name,
                idProject,
                links: []
            });
        },

        removeViewer(state, idViewer) {
            Vue.delete(state.viewers, idViewer);
        },

        addMap(state, {idViewer, wrapper}) {
            state.viewers[idViewer].maps.push(wrapper);
        },

        removeMap(state, {idViewer, index}) {
            state.viewers[idViewer].maps.splice(index, 1);
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

        // ----- Digital zoom

        setMaxZoom(state, {idViewer, index, maxZoom}) {
            state.viewers[idViewer].maps[index].maxZoom = maxZoom;
        },

        setDigitalZoom(state, {idViewer, index, digitalZoom}) {
            state.viewers[idViewer].maps[index].digitalZoom = digitalZoom;
        },

        // ----- Terms

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

        setDisplayNoTerm(state, {idViewer, index, value}) { // TODO: change name
            state.viewers[idViewer].maps[index].displayNoTerm = value;
            // TODO: unselect annot if no longer displayed
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

        // ----- Draw tools and associated interactions

        activateTool(state, {idViewer, index, tool}) {
            state.viewers[idViewer].maps[index].activeTool = tool;
        },

        activateEditTool(state, {idViewer, index, tool}) {
            state.viewers[idViewer].maps[index].activeEditTool = tool;
        },

        // ----- Annotation details

        setDisplayAnnotDetails(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].displayAnnotDetails = value;
        },

        setPositionAnnotDetails(state, {idViewer, index, value}) {
            state.viewers[idViewer].maps[index].positionAnnotDetails = value;
        },

        // ----- Undo/Redo

        addAction(state, {idViewer, index, feature, oldAnnot}) {
            let action = {feature, oldAnnot};
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

            let termsPromise = TermCollection.fetchAll({filterKey: "project", filterValue: image.project}); // TODO: decide how API calls are handled (here or in component?)
            let propertiesKeysPromise = PropertyCollection.fetchKeysAnnotationProperties(null, image.id);

            if(image.imageServerURLs == null) {
                let imageServerURLs = await new AbstractImage({id: image.baseImage}).fetchImageServers();
                image.imageServerURL = imageServerURLs[0];
            }

            let terms = await termsPromise;
            terms.array.forEach(term => {
                term.olStyle = createColorStyle(term.color, defaultStroke); // must be handled in image (can change opacity in one particular viewer)
                term.visible = true;
                term.associateToNewAnnot = false;
            });

            let propertiesKeys = await propertiesKeysPromise;

            let wrapper = {
                imageInstance: image,

                maxZoom: image.depth + constants.DIGITAL_ZOOM_INCREMENT,
                digitalZoom: true,

                zoom: 0, // TODO
                center: [image.width/2, image.height/2],
                rotation: 0,
        
                activePanel: null,

                selectedLayers: null,

                terms: terms.array,
                displayNoTerm: true,

                propertiesKeys,
                selectedPropertyKey: null, // TODO: allow to select default property (https://github.com/cytomine/Cytomine-core/issues/1142)
                selectedPropertyColor: defaultColors[0],
                selectedPropertyValues: {},

                defaultStroke,
                defaultStyle: createColorStyle("#fff", defaultStroke, initialOpacity),
                layersOpacity: initialOpacity,

                selectedFeatures: [], // old value: new Collection()
                annotsToSelect: [],

                activeTool: "select",
                activeEditTool: null,

                displayAnnotDetails: true,
                positionAnnotDetails: {x: 0, y: 0},

                actions: [],
                undoneActions: []
            };
            commit("addMap", {idViewer, wrapper});
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
            let keys = await PropertyCollection.fetchKeysAnnotationProperties(null, idImage);
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
