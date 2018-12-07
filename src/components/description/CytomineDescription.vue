<template>
<div :class="['description-wrapper', loading ? 'loading' : '']">
    <b-loading :is-full-page="false" :active="loading" class="small"></b-loading>
    <template v-if="!loading">
        <template v-if="definedDescription">
            <div class="ql-snow">
                <div class="ql-editor" v-html="previewDescription"></div> <!-- WARNING can lead to js injection -->
            </div>
            <a @click="openModal(false)"> {{ $t("see-full-text") }} </a> 
            {{ $t("or") }} 
            <a @click="openModal(true)"> {{ $t("edit") }} </a>
        </template>
        <template v-else>
            <em>{{$t("no-description")}}</em>
            <a @click="openModal(true)"> {{ $t("add-one") }} </a>    
        </template>
    </template>
</div>
</template>

<script>
import {Description} from "cytomine-client";
import DescriptionModal from "./CytomineDescriptionModal";

import constants from "@/utils/constants.js";

export default {
    name: "cytomine-description",
    components: {DescriptionModal},
    props: ["object"],
    data() {
        return {
            loading: true,
            description: null,
            modalOpened: false
        };
    },
    computed: {
        definedDescription() {
            return !this.description.isNew();
        },
        previewDescription() {
            if(this.description == null) {
                return null;
            }

            let posStop = this.description.data.indexOf(constants.STOP_PREVIEW_KEYWORD);
            if(posStop != -1) {
                return this.description.data.substring(0, posStop);
            }
            else if(this.description.data.length > 250) {
                return this.description.data.substring(0, 250) + "...";
            }
            else {
                return this.description.data;
            }
        }
    },
    methods: {
        openModal(edit) {
            // required to use programmatic modal because the description is sometimes displayed in elements with a
            // CSS transform (e.g. popover) that conflict with the fixed position of the modal 
            // (http://meyerweb.com/eric/thoughts/2011/09/12/un-fixing-fixed-elements-with-css-transforms/)
            
            
            this.$modal.open({
                parent: this,
                component: DescriptionModal,
                props: {description: this.description, edit},
                hasModalCard: true
            });
        }
    },
    async created() {
        try {
            this.description = await Description.fetch(this.object);
        }
        catch(err) {
            // the error may make sense if the object has no description
            this.description = new Description({data: "", object: this.object});
        }
        this.loading = false;
    }

};
</script>

<style>
.description-wrapper {
    position: relative;
}

.description-wrapper .ql-editor {
    padding: 0px;
    white-space: normal;
}

.description-wrapper.loading {
    min-height: 3em;
}
</style>