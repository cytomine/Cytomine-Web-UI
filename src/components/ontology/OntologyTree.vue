<template>
<div class="ontology-tree" :class="{selector: allowSelection, draggable: allowDrag, editable: allowEdition}">
    <sl-vue-tree v-model="treeNodes" :allowMultiselect="false" @select="select" @drop="drop" ref="tree">
        <template slot="toggle" slot-scope="{node}">
            <template v-if="!node.data.hidden && !node.isLeaf && node.children.length > 0">
                <i :class="['tree-toggle', 'fas', node.isExpanded ? 'fa-angle-down' : 'fa-angle-right']"></i>
            </template>
            <div class="sl-vue-tree-gap"></div>
        </template>

        <template slot="title" slot-scope="{node}">
            <div v-if="!node.data.hidden" class="tree-selector">
                <i class="tree-checkbox"
                   v-if="allowSelection"
                   :class="node.isSelected ? ['fas', 'fa-check-square'] : ['far', 'fa-square']">
                </i>
                <cytomine-term :term="node.data"></cytomine-term>
            </div>
        </template>

        <template slot="sidebar" slot-scope="{node}" v-if="!node.data.hidden">
            <slot name="custom-sidebar" :term="node.data">
                <div v-if="allowEdition" class="buttons">
                    <button class="button is-small" @click="startTermUpdate(node)">
                        <span class="icon is-small">
                            <i class="fas fa-edit"></i>
                        </span>
                    </button>
                    <button class="button is-small" @click="confirmTermDeletion(node)">
                        <span class="icon is-small">
                            <i class="far fa-trash-alt"></i>
                        </span>
                    </button>
                </div>
            </slot>
        </template>
    </sl-vue-tree>

    <slot v-if="noResult" name="no-result">
        <em class="has-text-grey no-result">{{$t('no-result')}}</em>
    </slot>

    <div v-if="allowEdition" class="add-term-container">
        <button class="button is-small is-link" @click="startTermCreation()">{{$t("add-term")}}</button>
    </div>

    <term-modal :active.sync="activeModal" :term="editedNode ? editedNode.data : null" :ontology="ontology"
        @newTerm="createTerm" @updateTerm="updateTerm">
    </term-modal>

</div>
</template>

<script>
import SlVueTree from "sl-vue-tree";
import CytomineTerm from "./CytomineTerm";
import TermModal from "./TermModal";
import {Term} from "cytomine-client";

export default {
    name: "ontology-tree",
    model: {
        prop: "selectedNodes",
        event: "setSelectedNodes"
    },
    props: {
        ontology: {type: Object},
        additionalNodes: {type: Array, default: () => []},
        searchString: {type: String, default: ""},
        selectedNodes: {type: Array, default: () => []},
        allowSelection: {type: Boolean, default: true},
        allowDrag: {type: Boolean, default: false},
        allowEdition: {type: Boolean, default: false}
    },
    components: {
        SlVueTree,
        CytomineTerm,
        TermModal
    },
    data() {
        return {
            treeNodes: [],
            internalSelectedNodes: [],
            activeModal: false,
            editedNode: null
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

            let nodes = this.createSubTree(this.ontology.children.array.slice());
            nodes.push(...this.createSubTree(this.additionalNodes.slice()));
            this.treeNodes = nodes;

            this.filter();
        },

        createSubTree(terms) {
            return terms.map(term => this.createNode(term));
        },

        createNode(term) {
            return {
                title: term.name,
                isLeaf: false, // all terms can be used as parent for drag and drop
                isDraggable: this.isDraggable,
                isExpanded: true,
                isSelected: this.internalSelectedNodes.includes(term.id),
                data: {
                    id: term.id,
                    name: term.name,
                    color: term.color,
                    parent: term.parent,
                    ontology: this.ontology.id,
                    hidden: false
                },
                children: term.children && term.children.length > 0 ? this.createSubTree(term.children) : []
            };
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

        select(nodes, event) {
            if(!this.allowSelection) {
                return;
            }

            if(this.clickOnTreeSelector(event.target)) {
                nodes.forEach(node => {
                    let indexSelected = this.internalSelectedNodes.indexOf(node.data.id);
                    if(indexSelected >= 0) {
                        this.internalSelectedNodes.splice(indexSelected, 1);
                        this.$emit("unselect", node.data.id);
                    }
                    else {
                        this.internalSelectedNodes.push(node.data.id);
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
        },

        startTermCreation() {
            this.editedNode = null;
            this.activeModal = true;
        },
        createTerm(term) {
            this.treeNodes.push(this.createNode(term));
        },

        startTermUpdate(node) {
            this.editedNode = node;
            this.activeModal = true;
        },
        updateTerm(term) {
            this.$refs.tree.updateNode(this.editedNode.path, {data: {...term}});
        },

        drop(nodes, position) {
            nodes.forEach(async node => {
                let idParent = (position.placement == "inside") ? position.node.data.id : position.node.data.parent;
                if(node.data.parent !== idParent) {
                    try {
                        await new Term(node.data).changeParent(idParent);
                        this.applyToAllNodes(tmp => {
                            if(tmp.data.id == node.data.id) {
                                tmp.data.parent = idParent;
                            }
                        });
                    }
                    catch(error) {
                        console.log(error);
                        this.$notify({type: "error", text: this.$t("notif-error-ontology-tree-update")});
                    }
                }
                else {
                    this.$notify({type: "warn", text: this.$t("notif-warn-ontology-tree-order-not-persisted")});
                }
            });
        },

        confirmTermDeletion(node) {
            this.$dialog.confirm({
                title: this.$t("confirm-deletion"),
                message: this.$t("confirm-deletion-term", {name: node.data.name}),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.deleteTerm(node)
            });
        },
        async deleteTerm(node) {
            try {
                await Term.delete(node.data.id);
                this.$refs.tree.remove([node.path]);
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-term-deletion")});
            }
        }
    },
    created() {
        this.internalSelectedNodes = this.selectedNodes.slice();
        this.makeTree();
    }
};
</script>

<style scoped>
.add-term-container {
    text-align: center;
    margin-top: 0.5em;
}
</style>


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

.ontology-tree .buttons, .ontology-tree .button {
    margin-bottom: 0px !important;
}

.ontology-tree.editable .sl-vue-tree-sidebar {
    width: 100px;
    padding-left: 20px;
    flex-shrink: 0;
}

.ontology-tree.editable .sl-vue-tree-sidebar {
    display: flex;
    align-items: top;
}
</style>
