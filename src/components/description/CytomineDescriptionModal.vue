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
            <div class="ql-editor preview"  v-html="descriptionWithoutKeywords"></div>
        </div>

        <template v-else>
            <div id="tooltip-container"></div> <!-- invisible div defining the allowed positions for ql tooltip -->

            <div class="keyword-info">
                <i class="fas fa-info-circle"></i>
                <i18n path="info-keyword-stop-preview-description">
                    <span place="keyword" class="keyword"> {{ stopPreviewKeyword }} </span>
                </i18n>
            </div>

            <quill-editor
                v-model="descriptionContent"
                :options="editorOptions"
                ref="quillEditor">

                <div id="toolbar" slot="toolbar">

                    <span class="ql-formats">
                        <select class="ql-header">
                            <option selected> {{ $t("ql-paragraph") }} </option>
                            <option value="1"> {{ $t("ql-header-1") }} </option>
                            <option value="2"> {{ $t("ql-header-2") }} </option>
                            <option value="3"> {{ $t("ql-header-3") }} </option>
                            <option value="4"> {{ $t("ql-header-4") }} </option>
                        </select>
                    </span>

                    <span class="ql-formats" :title="$t('ql-font')">
                        <select class="ql-font">
                            <option selected></option>
                            <option value="serif"></option>
                            <option value="monospace"></option>
                        </select>
                    </span>

                    <span class="ql-formats">
                        <button class="ql-bold" :title="$t('ql-bold')"></button>
                        <button class="ql-italic" :title="$t('ql-italic')"></button>
                        <button class="ql-underline" :title="$t('ql-italic')"></button>
                    </span>

                    <!-- Add subscript and superscript buttons -->
                    <span class="ql-formats">
                        <button class="ql-script" value="sub" :title="$t('ql-subscript')"></button>
                        <button class="ql-script" value="super" :title="$t('ql-superscript')"></button>
                    </span>

                    <span class="ql-formats">
                        <span :title="$t('ql-font-color')">
                            <select class="ql-color"></select>
                        </span>
                        <span :title="$t('ql-background-color')">
                            <select class="ql-background"></select>
                        </span>
                    </span>

                    <span class="ql-formats" :title="$t('ql-align')">
                        <select class="ql-align">
                            <option selected></option>
                            <option value="center"></option>
                            <option value="right"></option>
                        </select>
                    </span>

                    <span class="ql-formats">
                        <button class="ql-indent" value="-1" :title="$t('ql-indent-left')"></button>
                        <button class="ql-indent" value="+1" :title="$t('ql-indent-right')"></button>
                    </span>

                    <span class="ql-formats">
                        <button class="ql-list" value="ordered" :title="$t('ql-ordered-list')"></button>
                        <button class="ql-list" value="bullet" :title="$t('ql-bullet-list')"></button>
                    </span>

                    <span class="ql-formats">
                        <button class="ql-blockquote" :title="$t('ql-blockquote')"></button>
                        <button class="ql-code-block" :title="$t('ql-code-block')"></button>
                    </span>

                    <span class="ql-formats">
                        <button class="ql-clean" :title="$t('ql-clean-format')"></button>                    
                    </span>

                    <span class="ql-formats">
                        <button class="ql-link" :title="$t('ql-link')"></button>
                        <button class="ql-image" :title="$t('ql-image')"></button>
                        <button class="ql-video" :title="$t('ql-video')"></button>
                    </span>

                    <span class="ql-formats">
                        <span :class="['ql-picker', expandedSpecialChars ? 'ql-expanded' : '', 'ql-special-characters']" 
                        :title="$t('ql-special-character')"
                        @click="expandedSpecialChars = !expandedSpecialChars" 
                        v-click-outside="() => expandedSpecialChars = false">
                            <span class="ql-picker-label" tabindex="0" role="button">
                                <svg viewBox="0 0 18 18"> 
                                    <polygon class="ql-stroke" points="7 11 9 13 11 11 7 11"></polygon> 
                                    <polygon class="ql-stroke" points="7 7 9 5 11 7 7 7"></polygon> 
                                </svg>
                            </span>

                            <span class="ql-picker-options">
                                <button class="special-char" v-for="char in specialCharacters" :key="char" 
                                @click="insertSpecialCharacter(char)">
                                    {{ char }}
                                </button>
                            </span>
                        </span>
                    </span>
                </div>

            </quill-editor> 
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
import { quillEditor } from "vue-quill-editor";

import constants from "@/utils/constants.js";

export default {
    name: "cytomine-description-modal",
    components: {quillEditor},
    props: [
        "description",
        "edit"
    ],
    data() {
        return {
            descriptionContent: "",
            editorOptions: {
                bounds: "#tooltip-container",
                placeholder: this.$t("enter-description"),
                modules: {
                    toolbar: "#toolbar"
                }
            },
            expandedSpecialChars: false,
            specialCharacters: [
                "$", "€", "£", "¢", "¥", "¤", "‰", "©", "®", "™", "§", "¶", "Æ", "æ", "Œ", "œ", 
                "±", "×", "÷", "⇒", "⇔", "∏", "∑", "≃", "≤", "≥"
            ],
            expanded: false
        };
    },
    computed: {
        descriptionWithoutKeywords() {
            return this.description.data.replace(new RegExp(constants.STOP_PREVIEW_KEYWORD, "g"), "");
        },
        quill() {
            return this.$refs.quillEditor.quill;
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
        },
        insertSpecialCharacter(char) {
            let range = this.quill.getSelection(true);
            if(range.length != 0) {
                this.quill.deleteText(range.index, range.length, "user");
            }
            this.quill.insertText(range.index, char, "user");
            this.quill.setSelection(range.index + 1);   
        }
    },
    created() {
        this.descriptionContent = this.description.data;
    }    
};
</script>


<style>
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

.description-modal .ql-editor.preview {
    padding: 0px 0px 10px 0px;
    text-align: justify;
    white-space: normal;
}

.description-modal .modal-card-body {
    display: flex;
    flex-direction: column;
    position: relative;
}

.description-modal .keyword-info {
    margin-bottom: 15px;
}

.description-modal .keyword-info .fas {
    margin-right: 6px;
}

.description-modal .keyword-info .keyword {
    font-weight: 600;
}

.description-modal .quill-editor {
    min-height: 30vh;
    display: flex;
    flex-direction: column;
    flex: 1;
} 

.description-modal .ql-container {
    overflow: auto;
    flex-grow: 1;
}

#tooltip-container {
    position: absolute;
    left: 30px;
    right: 40px;
    top: 0px;
    bottom: 0px;
    pointer-events: none; /* to allow selection of elements below it */
}

.description-modal .ql-bold svg, .ql-italic svg, .ql-underline svg {
    display: none;
}

.description-modal .ql-bold::before {
    content:"A";
    font-weight: 600;
}

.description-modal .ql-italic::before {
    content:"A";
    font-style: italic;
}

.description-modal .ql-underline::before {
    content:"A";
    text-decoration: underline;
}

.ql-picker.ql-special-characters .ql-picker-label::before {
    content: "\03A9"; /* Omega */
    font-weight: 600;
    margin-right: 20px;
}

.ql-picker.ql-special-characters .ql-picker-options  {
    white-space: normal;
    width: 186px;
}

.special-char {
    display: inline-block !important;
    float: none !important;
}

.special-char:hover {
    background: #f5f5f5 !important;
}

</style>