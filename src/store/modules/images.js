import Vue from "vue";

import Collection from "ol/Collection";

import {TermCollection} from "cytomine-client";

import {isCluster, createColorStyle, createDefaultStroke, createTextStyle, changeOpacity, selectStyles,
    verticesStyle} from "@/utils/style-utils.js";

export default {
    state: {
        images: {}
    },

    mutations: {
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

        // ----- Terms visibility

        toggleTermVisibility(state, {idImage, indexTerm}) {
            let term = state.images[idImage].terms[indexTerm];
            term.displayed = !term.displayed;
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
            wrapper.selectedLayers.push(layer);
            wrapper.map.addLayer(layer.olLayer);
        },

        removeLayer(state, {idImage, indexLayer}) {
            let wrapper = state.images[idImage];
            wrapper.map.removeLayer(wrapper.selectedLayers[indexLayer].olLayer);
            wrapper.selectedLayers[indexLayer].olLayer = null;
            wrapper.selectedLayers.splice(indexLayer, 1);
        },

        toggleLayerVisibility(state, {idImage, indexLayer}) {
            let layer = state.images[idImage].selectedLayers[indexLayer];
            layer.displayed = !layer.displayed;
            layer.olLayer.setVisible(layer.displayed);
        },

        setLayersOpacity(state, {idImage, opacity}) {
            let wrapper = state.images[idImage];
            wrapper.layersOpacity = opacity;
            wrapper.terms.forEach(term => changeOpacity(term.olStyle, opacity));
            changeOpacity(wrapper.defaultStyle, opacity);
            let colorStroke = wrapper.defaultStroke.getColor();
            colorStroke[3] = opacity;
        },

        refreshSelectedLayers(state, idImage) {
            let wrapper = state.images[idImage];
            wrapper.selectedLayers.forEach(layer => layer.olLayer.changed());
            wrapper.selectedFeatures.forEach(feature => feature.changed());
        },

        // ----- Selected features

        clearSelectedFeatures(state, idImage) {
            let wrapper = state.images[idImage];
            wrapper.selectedFeatures.clear();
            wrapper.annotsToSelect = [];
        },

        reselectFeature(state, {idImage, feature}) {
            let wrapper = state.images[idImage];
            let index = wrapper.annotsToSelect.findIndex(annot => annot.id == feature.get("annot").id);
            wrapper.annotsToSelect.splice(index, 1);
            wrapper.selectedFeatures.push(feature);
        },

        removeLayerFromSelectedFeatures(state, {idImage, idLayer, cache=false}) {
            let wrapper = state.images[idImage];

            let selectedFeatures = wrapper.selectedFeatures;
            for(let index = selectedFeatures.getLength() - 1; index >= 0; index--) {
                let feature = selectedFeatures.item(index);
                if(feature.get("annot").user == idLayer) {
                    selectedFeatures.removeAt(index);
                    if(cache) {
                        wrapper.annotsToSelect.push(feature.get("annot"));
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

        setInteraction(state, {idImage, interaction}) {
            let wrapper = state.images[idImage];
            if(wrapper.currentInteraction != null) {
                wrapper.map.removeInteraction(wrapper.currentInteraction);
            }
            wrapper.currentInteraction = interaction;
            if(interaction != null) {
                wrapper.map.addInteraction(interaction);
            }
        },

        setEditInteraction(state, {idImage, interaction}) {
            let wrapper = state.images[idImage];
            if(wrapper.currentEditInteraction != null) {
                wrapper.map.removeInteraction(wrapper.currentEditInteraction);
            }
            wrapper.currentEditInteraction = interaction;
            if(interaction != null) {
                wrapper.map.addInteraction(interaction);
            }
        },

        // ----- Undo/Redo

        addAction(state, {idImage, action}) {
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
        async addImage({commit}, {image, map, imageLayer}) {
            let id = image.id;

            let initialOpacity = 0.5;
            let defaultStroke = createDefaultStroke(initialOpacity);

            let terms = await TermCollection.fetchWithFilter("project", image.project); // TODO: decide how API calls are handled (here or in component?)
            terms.array.forEach(term => {
                term.olStyle = createColorStyle(term.color, defaultStroke); // should be handled in image ! (can change opacity in one particular viewer)
                term.displayed = true;
            });

            let wrapper = {
                imageInstance: image,
                map,
                imageLayer,
                activePanel: null,

                selectedLayers: null,

                terms: terms.array,
                displayNoTerm: true,

                defaultStroke,
                defaultStyle: createColorStyle("#fff", defaultStroke, initialOpacity),
                layersOpacity: initialOpacity,

                selectedFeatures: new Collection(),
                annotsToSelect: [],

                activeTool: "select",
                currentInteraction: null,
                activeEditTool: null,
                currentEditInteraction: null,

                actions: [],
                undoneActions: []
            };
            commit("addImage", {id, wrapper});
        },

        toggleTermVisibility({commit}, payload) {
            commit("toggleTermVisibility", payload);
            commit("refreshSelectedLayers", payload.idImage);
        },

        setDisplayNoTerm({commit}, payload) {
            commit("setDisplayNoTerm", payload);
            commit("refreshSelectedLayers", payload.idImage);
        },

        setLayersOpacity({commit}, payload) {
            commit("setLayersOpacity", payload);
            commit("refreshSelectedLayers", payload.idImage);
        },

        removeLayer({state, commit}, {idImage, indexLayer, cacheSelectedFeatures}) {
            let idLayer = state.images[idImage].selectedLayers[indexLayer].id;
            commit("removeLayer", {idImage, indexLayer});
            commit("removeLayerFromSelectedFeatures", {idImage, idLayer, cache: cacheSelectedFeatures});
        },

        toggleLayerVisibility({state, commit}, {idImage, indexLayer}) {
            commit("toggleLayerVisibility", {idImage, indexLayer});
            let layer = state.images[idImage].selectedLayers[indexLayer];
            if(!layer.displayed) {
                commit("removeLayerFromSelectedFeatures", {idImage, idLayer: layer.id});
            }
        }
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
                let hasTermsToDisplay = imageWrapper.terms.some(term => term.displayed && annot.term.includes(term.id));

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
            if(imageWrapper.selectedFeatures.getArray().includes(feature)) {
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
