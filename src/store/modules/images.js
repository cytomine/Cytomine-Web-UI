import Vue from "vue";

import {TermCollection} from "cytomine-client";

import {isCluster, createColorStyle, createDefaultStroke, createTextStyle, changeOpacity, selectStyles,
    verticesStyle} from "@/utils/style-utils.js";

import {createGeoJsonFmt} from "vuelayers/lib/ol-ext/format";

export default {
    state: {
        triggerMapUpdateSize: [], // change of this property should trigger a size update of all visible maps
        images: {}
    },

    mutations: {

        // --- Mutations common to all images

        triggerMapUpdateSize(state) {
            state.triggerMapUpdateSize = []; // new array will be considered as a new value
        },

        // --- Image-specific mutations

        addImage(state, {id, wrapper}) {
            Vue.set(state.images, id, wrapper);
        },

        removeImage(state, idImage) {
            Vue.delete(state.images, idImage);
        },

        togglePanel(state, {idImage, panel}) {
            let imageWrapper = state.images[idImage];
            if(imageWrapper == null) {
                return;
            }
            if(imageWrapper.activePanel === panel) {
                imageWrapper.activePanel = null;
            }
            else {
                imageWrapper.activePanel = panel;
            }
        },

        // ----- View properties

        setCenter(state, {idImage, center}) {
            let imageWrapper = state.images[idImage];
            if(imageWrapper != null) {
                imageWrapper.center = center;
            }
        },

        setZoom(state, {idImage, zoom}) {
            let imageWrapper = state.images[idImage];
            if(imageWrapper != null) {
                imageWrapper.zoom = zoom;
            }
        },

        setRotation(state, {idImage, rotation}) {
            let imageWrapper = state.images[idImage];
            if(imageWrapper != null) {
                imageWrapper.rotation = rotation;
            }
        },

        // ----- Digital zoom

        setMaxZoom(state, {idImage, maxZoom}) {
            let imageWrapper = state.images[idImage];
            if(imageWrapper != null) {
                imageWrapper.maxZoom = maxZoom;
            }
        },

        setDigitalZoom(state, {idImage, digitalZoom}) {
            state.images[idImage].digitalZoom = digitalZoom;
        },

        // ----- Terms visibility

        toggleTermVisibility(state, {idImage, indexTerm}) {
            let term = state.images[idImage].terms[indexTerm];
            term.visible = !term.visible;
        },

        setDisplayNoTerm(state, {idImage, value}) { // TODO: change name
            state.images[idImage].displayNoTerm = value;
        },

        // ----- Selected layers

        addLayer(state, {idImage, layer}) {
            let wrapper = state.images[idImage];
            if(wrapper.selectedLayers == null) {
                wrapper.selectedLayers = [];
            }

            wrapper.selectedLayers.push({...layer});
        },

        removeLayer(state, {idImage, indexLayer}) {
            let wrapper = state.images[idImage];
            wrapper.selectedLayers.splice(indexLayer, 1);
        },

        toggleLayerVisibility(state, {idImage, indexLayer}) {
            let layer = state.images[idImage].selectedLayers[indexLayer];
            layer.visible = !layer.visible;
        },

        setLayersOpacity(state, {idImage, opacity}) {
            let wrapper = state.images[idImage];
            wrapper.layersOpacity = opacity;
            wrapper.terms.forEach(term => changeOpacity(term.olStyle, opacity));
            changeOpacity(wrapper.defaultStyle, opacity);
            let colorStroke = wrapper.defaultStroke.getColor();
            colorStroke[3] = opacity;
        },

        // ----- Selected features

        setSelectedFeatures(state, {idImage, selectedFeatures}) {
            let imageWrapper = state.images[idImage];
            if(imageWrapper != null) {
                imageWrapper.selectedFeatures = selectedFeatures;
            }
        },

        clearSelectedFeatures(state, idImage) {
            let wrapper = state.images[idImage];
            wrapper.selectedFeatures = [];
            wrapper.annotsToSelect = [];
        },

        selectFeature(state, {idImage, feature}) {
            state.images[idImage].selectedFeatures.push(createGeoJsonFmt().writeFeatureObject(feature));
        },

        removeLayerFromSelectedFeatures(state, {idImage, idLayer, cache=false}) {
            let wrapper = state.images[idImage];

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

        activateTool(state, {idImage, tool}) {
            state.images[idImage].activeTool = tool;
        },

        activateEditTool(state, {idImage, tool}) {
            state.images[idImage].activeEditTool = tool;
        },

        // ----- Annotation details

        setDisplayAnnotDetails(state, {idImage, value}) {
            state.images[idImage].displayAnnotDetails = value;
        },

        setPositionAnnotDetails(state, {idImage, value}) {
            state.images[idImage].positionAnnotDetails = value;
        },

        // ----- Undo/Redo

        addAction(state, {idImage, feature, oldAnnot}) {
            let action = {feature, oldAnnot};
            let wrapper = state.images[idImage];
            wrapper.actions.push(action);
            wrapper.undoneActions = [];
        },

        undoAction(state, {idImage, opposedAction}) {
            let wrapper = state.images[idImage];
            wrapper.actions.pop();
            wrapper.undoneActions.push(opposedAction);
        },

        redoAction(state, {idImage, opposedAction}) {
            let wrapper = state.images[idImage];
            wrapper.undoneActions.pop();
            wrapper.actions.push(opposedAction);
        },


    },

    actions: {
        async addImage({commit}, {image}) {
            let id = image.id;

            let initialOpacity = 0.5;
            let defaultStroke = createDefaultStroke(initialOpacity);

            let terms = await TermCollection.fetchAll({filterKey: "project", filterValue: image.project}); // TODO: decide how API calls are handled (here or in component?)
            terms.array.forEach(term => {
                term.olStyle = createColorStyle(term.color, defaultStroke); // must be handled in image (can change opacity in one particular viewer)
                term.visible = true;
            });

            let wrapper = {
                imageInstance: image,

                maxZoom: image.depth,
                digitalZoom: false,

                zoom: 2, // TODO
                center: [image.width/2, image.height/2],
                rotation: 0,
        
                activePanel: null,

                selectedLayers: null,

                terms: terms.array,
                displayNoTerm: true,

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
            commit("addImage", {id, wrapper});
        },

        removeLayer({state, commit}, {idImage, indexLayer, cacheSelectedFeatures}) {
            let idLayer = state.images[idImage].selectedLayers[indexLayer].id;
            commit("removeLayer", {idImage, indexLayer});
            commit("removeLayerFromSelectedFeatures", {idImage, idLayer, cache: cacheSelectedFeatures});
        },

        toggleLayerVisibility({state, commit}, {idImage, indexLayer}) {
            commit("toggleLayerVisibility", {idImage, indexLayer});
            let layer = state.images[idImage].selectedLayers[indexLayer];
            if(!layer.visible) {
                commit("removeLayerFromSelectedFeatures", {idImage, idLayer: layer.id});
            }
        },

        selectFeature({commit}, {idImage, feature}) {
            commit("clearSelectedFeatures", idImage);
            commit("selectFeature", {idImage, feature});
        },
    },

    getters: {
        genStyleFunction: state => image => (feature) => {
            let annot = feature.get("annot");
            if(annot == null) {
                return;
            }

            let imageWrapper = state.images[image];

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

            return styles;
        }
    }
};
