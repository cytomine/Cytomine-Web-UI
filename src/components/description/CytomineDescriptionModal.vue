<template>
<div class="description-modal modal-card" :class="{expanded: expanded}">
    <div class="modal-card-head"> 
        <p class="modal-card-title">{{ $t("description") }}</p>
        <button class="button is-small" @click="expanded = !expanded">
            <i :class="['fas', expanded ? 'fa-compress' : 'fa-expand']"></i>
        </button>
    </div>
    <div class="modal-card-body">

        <div v-if="!edit" class="ql-snow">
            <div class="ql-editor preview" v-html="descriptionWithoutKeywords"></div>
        </div>

        <template v-else>
            <div class="keyword-info">
                <i class="fas fa-info-circle"></i>
                <i18n path="info-keyword-stop-preview-description">
                    <span place="keyword" class="keyword"> {{ stopPreviewKeyword }} </span>
                </i18n>
            </div>

            <cytomine-quill-editor v-model="descriptionContent" :placeholder="$t('enter-description')"></cytomine-quill-editor>
        </template>
    </div>
    <div class="modal-card-foot">
        <button class="button" @click="$parent.close()"> 
            {{ edit ? $t("button-cancel") : $t("button-close") }} 
        </button>
        <button v-if="edit" class="button is-link" @click="save()"> {{ $t("button-save") }} </button>
    </div>
</div>
</template>

<script>
import CytomineQuillEditor from "@/components/form/CytomineQuillEditor";
import constants from "@/utils/constants.js";

export default {
    name: "cytomine-description-modal",
    components: {CytomineQuillEditor},
    props: [
        "description",
        "edit"
    ],
    data() {
        return {
            descriptionContent: "",
            expanded: false
        };
    },
    computed: {
        descriptionWithoutKeywords() {
            return this.description.data.replace(new RegExp(constants.STOP_PREVIEW_KEYWORD, "g"), "");
        },
        stopPreviewKeyword() {
            return constants.STOP_PREVIEW_KEYWORD;
        }
    },
    methods: {
        async save() {
            let oldData = this.description.data;
            try {
                this.description.data = this.descriptionContent;
                await this.description.save();
                this.$parent.close();
            }
            catch(error) {
                this.description.data = oldData;
                this.$notify({type: "error", text: this.$t("notif-error-update-description")});
            }
        }
    },
    created() {
        this.descriptionContent = this.description.data;
    }    
};
</script>

<style lang="scss">
.description-modal.expanded, .description-modal.expanded .modal-card-body {
    width: 90vw;
    height: 90vh;
    max-height: 90vh;
}

.description-modal:not(.expanded), .description-modal:not(.expanded) .modal-card-body {
    width: 50vw;
    height: 60vh;
    max-height: 60vh;
}

.description-modal {
    .ql-editor.preview {
        padding: 0px 0px 10px 0px;
        text-align: justify;
        white-space: normal;
    }

    .modal-card-body {
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .keyword-info {
        margin-bottom: 1em;

        .fas {
            margin-right: 0.75em;
        }

        .keyword {
            font-weight: 600;
        }
    }

    .cytomine-quill-editor {
        flex: 1;
    }
}
</style>
