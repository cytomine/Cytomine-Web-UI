<template>
<b-modal :active="active" @close="$emit('update:active', false)" :has-modal-card="true">
    <div class="modal-card metadata-modal">
        <header class="modal-card-head">
            <p class="modal-card-title">{{$t("image-metadata")}}</p>
        </header>
        <section class="modal-card-body">
            <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
                <h2> {{ $t("error") }} </h2>
                <p> {{ $t("unexpected-error-info-message") }} </p>
            </b-message>
            <template v-else>
                <p v-if="abstractImage && abstractImage.macroURL" :style="styleImagePreview" class="image-preview">
                    <img :class="'rotate-' + rotationAngle" :src="abstractImage.macroURL" ref="image">
                </p>
                <div class="buttons is-centered are-small">
                    <button class="button" @click="rotate(-90)"><i class="fas fa-undo"></i></button>
                    <button class="button" @click="rotate(90)"><i class="fas fa-undo mirror"></i></button>
                </div>

                <b-input
                    v-model="searchString"
                    :placeholder="$t('search-placeholder')"
                    type="search"
                    icon="search"
                    size="is-small"
                />
                <ul>
                    <li v-for="prop in filteredProps" :key="prop.id">
                        <strong>{{prop.key}}</strong>: {{prop.value}}
                    </li>
                </ul>
            </template>
        </section>
        <footer class="modal-card-foot">
            <button class="button" type="button" @click="$emit('update:active', false)">
                {{$t("button-close")}}
            </button>
        </footer>
    </div>
</b-modal>
</template>

<script>
import {AbstractImage, PropertyCollection} from "cytomine-client";
export default {
    name: "image-metadata-modal",
    props: {
        active: Boolean,
        idAbstractImage: Number
    },
    data() {
        return {
            error: false,
            abstractImage: null,
            properties: [],
            searchString: "",
            rotationAngle: 0
        };
    },
    computed: {
        filteredProps() {
            if(this.searchString.length === 0) {
                return this.properties;
            }
            let str = this.searchString.toLowerCase();
            return this.properties.filter(prop => {
                return prop.key.toLowerCase().indexOf(str) >= 0 || prop.value.toLowerCase().indexOf(str) >= 0;
            });
        },
        styleImagePreview() {
            this.rotationAngle; // to force re-evaluation each time rotationAngle changes
            if(!this.$refs.image) {
                return;
            }

            let reverse = (this.rotationAngle == 90 || this.rotationAngle == 270);
            let width = this.$refs.image.clientWidth + "px";
            let height = this.$refs.image.clientHeight + "px";
            return {
                width: reverse ? height : width,
                height: reverse ? width : height,
                textAlign: "unset"
            };
        }
    },
    methods: {
        async rotate(val) {
            this.rotationAngle = (this.rotationAngle + val + 360) % 360;
        }
    },
    async created() {
        try {
            this.abstractImage = await AbstractImage.fetch(this.idAbstractImage);
            this.properties = (await PropertyCollection.fetchAll({object: this.abstractImage})).array;
            this.properties.sort((a, b) => a.key.localeCompare(b.key));
        }
        catch(error) {
            console.log(error);
            this.error = true;
        }
    }
};
</script>

<style lang="scss">
.metadata-modal.modal-card {
    &, .modal-card-body {
        width: 800px;
        max-width: 100%;
    }

    .image-preview {
        margin: auto;
        overflow: hidden;
        margin-bottom: 0.5em;
        text-align: center;
    }

    img {
        transform-origin: top left;
        max-width: unset;

        &.rotate-90 {
            transform: rotate(90deg) translateY(-100%);
        }

        &.rotate-180 {
            transform: rotate(180deg) translate(-100%,-100%);
        }

        &.rotate-270 {
            transform: rotate(270deg) translateX(-100%);
        }
    }

    .mirror {
        transform: scale(-1, 1);
    }

    input {
        max-width: 30em;
        margin-bottom: 1em;
    }

    li {
        overflow-wrap: break-word;
    }
}
</style>
