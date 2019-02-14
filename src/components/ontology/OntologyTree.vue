<template>
<div class="ontology-tree" :class="{selector: allowSelection}">
    <sl-vue-tree v-model="treeNodes" :allowMultiselect="false" @select="select">
        <template slot="toggle" slot-scope="{node}">
            <template v-if="!node.data.hidden && !node.isLeaf">
                <i :class="['tree-toggle', 'fas', node.isExpanded ? 'fa-angle-down' : 'fa-angle-right']"></i>
            </template>
        </template>

        <template slot="title" slot-scope="{node}">
            <div v-if="!node.data.hidden" class="tree-selector">
                <i class="tree-checkbox"
                   v-if="allowSelection"
                   :class="classNames(node)">
                </i>
                <cytomine-term :term="node.data"></cytomine-term>
            </div>
        </template>

        <template slot="sidebar" slot-scope="{node}">
            <slot v-if="!node.data.hidden" name="sidebar" :term="node.data"></slot>
        </template>
    </sl-vue-tree>

    <slot v-if="noResult" name="no-result">
        <em class="has-text-grey no-result">{{$t('no-result')}}</em>
    </slot>
</div>
</template>

<script>
import SlVueTree from "sl-vue-tree";
import CytomineTerm from "./CytomineTerm";

export default {
    name: "ontology-tree",
    model: {
        prop: "selectedNodes",
        event: "setSelectedNodes"
    },
    props: {
        ontology: {type: Object},
        additionalNodes: {type: Array, default: () => []},
        startWithAdditionalNodes: {type: Boolean, default: false},
        searchString: {type: String, default: ""},
        selectedNodes: {type: Array, default: () => []},
        allowSelection: {type: Boolean, default: true},
        multipleSelection: {type: Boolean, default: true}
    },
    components: {
        SlVueTree,
        CytomineTerm
    },
    data() {
        return {
            treeNodes: [],
            internalSelectedNodes: []
        };
    },
    computed: {
        lowCaseSearchString() {
            return this.searchString.toLowerCase();
        },
        noResult() {
            return this.treeNodes.every(node => node.data.hidden);
        }
    },
    watch: {
        ontology() {
            this.makeTree();
        },
        additionalNodes() {
            this.makeTree();
        },
        selectedNodes() {
            this.internalSelectedNodes = this.selectedNodes.slice();
            this.refreshNodeSelection();
        },
        lowCaseSearchString() {
            this.filter();
        }
    },
    methods: {
        makeTree() {
            if(this.ontology == null) {
                this.treeNodes = [];
                return;
            }

            let nodes = this.createNodes(this.ontology.children.array.slice());
            let additionalNodes = this.createNodes(this.additionalNodes.slice());
            this.treeNodes = this.startWithAdditionalNodes ? additionalNodes.concat(nodes) : nodes.concat(additionalNodes);

            this.filter();
        },

        createNodes(nodes) {
            return nodes.map(node => {
                return {
                    title: node.name,
                    isLeaf: !node.isFolder,
                    isDraggable: false,
                    isExpanded: true,
                    isSelected: this.internalSelectedNodes.includes(node.id),
                    data: {
                        id: node.id,
                        name: node.name,
                        color: node.color,
                        hidden: false
                    },
                    children: node.children && node.children.length > 0 ? this.createNodes(node.children) : null
                };
            });
        },

        filter() {
            let str = this.lowCaseSearchString;
            this.applyToAllNodes(node => {
                let match = node.title.toLowerCase().indexOf(str) >= 0;
                if(node.children) {
                    let matchInChildren = node.children.some(child => !child.data.hidden); // OK because applyToAllNodes performs bottom-up operations
                    node.isExpanded = matchInChildren;
                    match = match || matchInChildren;
                }
                node.data.hidden = !match;
            });
        },

        classNames(node) {
            if(this.multipleSelection) {
                return node.isSelected ? ["fas", "fa-check-square"] : ["far", "fa-square"];
            }
            else {
                return node.isSelected ? ["fas", "fa-dot-circle"] : ["far", "fa-circle"];
            }
        },

        select(nodes, event) {
            if(!this.allowSelection) {
                return;
            }

            if(this.clickOnTreeSelector(event.target)) {
                nodes.forEach(node => {
                    if(this.multipleSelection) {
                        let indexSelected = this.internalSelectedNodes.indexOf(node.data.id);
                        if(indexSelected >= 0) {
                            this.internalSelectedNodes.splice(indexSelected, 1);
                            this.$emit("unselect", node.data.id);
                        }
                        else {
                            this.internalSelectedNodes.push(node.data.id);
                            this.$emit("select", node.data.id);
                        }
                    }
                    else {
                        this.internalSelectedNodes = [node.data.id];
                        this.$emit("select", node.data.id);
                    }
                });
                this.$emit("setSelectedNodes", this.internalSelectedNodes);
            }

            this.refreshNodeSelection();
        },
        refreshNodeSelection() {
            if(!this.allowSelection) {
                return;
            }

            this.applyToAllNodes(node => {
                node.isSelected = this.internalSelectedNodes.some(id => id == node.data.id);
            });
        },
        clickOnTreeSelector(elem) {
            if(elem.classList.contains("tree-selector")) {
                return true;
            }
            return elem.parentElement ? this.clickOnTreeSelector(elem.parentElement) : false;
        },
        applyToAllNodes(fct, nodes=this.treeNodes) {
            nodes.forEach(node => {
                if(node.children) {
                    this.applyToAllNodes(fct, node.children);
                }
                fct(node);
            });
        }
    },
    created() {
        this.internalSelectedNodes = this.selectedNodes.slice();
        this.makeTree();
    }
};
</script>

<style>
.ontology-tree {
    padding: 0px 0px 2px 0px;
}

.ontology-tree .tree-checkbox {
    font-size: 16px;
    margin-right: 10px;
    color: rgba(0, 0, 0, 0.2);;
}

.ontology-tree.selector .sl-vue-tree-node-item:hover {
    background: rgba(0, 0, 0, 0.05);
}

.ontology-tree.selector .sl-vue-tree-selected > .sl-vue-tree-node-item {
    background: rgba(0, 0, 0, 0.05);
    font-weight: 600;
}

.ontology-tree .sl-vue-tree-selected > .sl-vue-tree-node-item .tree-checkbox {
    color: #61b2e8;
}

.ontology-tree.selector .sl-vue-tree-gap {
    width: 24px;
}

.ontology-tree.selector .tree-selector {
    cursor: pointer;
    flex-grow: 1;
    word-break: break-all !important;
}

.ontology-tree .tree-selector:hover .tree-checkbox {
    color: #61b2e8;
}

.ontology-tree .no-result {
    margin-left: 20px;
    line-height: 2.2;
    font-size: 14px;
}
</style>
