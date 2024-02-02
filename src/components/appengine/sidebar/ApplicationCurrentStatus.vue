<template>
    <div>
        <b-collapse class="card" animation="slide" aria-id="contentIdForA11y3">
            <template #trigger="props">
                <div class="card-header" role="button" aria-controls="contentIdForA11y3" :aria-expanded="props.open">
                    <p class="card-header-title subtitle">
                        <i class="far fa-bell"></i>
                        {{ $t('app-engine.ae-current-status') }}
                    </p>
                    <a class="card-header-icon">
                        <b-icon :icon="props.open ? 'angle-down' : 'angle-up'">
                        </b-icon>
                    </a>
                </div>
            </template>

            <div class="card-content">
                <div class="content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec iaculis mauris.
                    <a>#buefy</a>.
                </div>
            </div>
        </b-collapse>
    </div>
</template>

<script>
import { get, sync } from '@/utils/store-helpers';

export default {
    name: 'application-current-status',
    data() {
        return {

        };
    },
    computed: {
        project: get('currentProject/project'),
    },
    methods: {

    },
};
</script>

<style lang="scss" scoped>
$background: #444;
$activeBackground: #4f4f4f;
$hoverBackground: #82aad8;
$color: #ccc;
$activeColor: #eee;
$hoverColor: white;
$arrowBackground: #484848;
$border: #383838;
$arrowColor: #888;

.div {
    display: flex;
    height: 100%;
    background: $background;
    overflow: hidden;
    transition: width .2s linear;
    width: 4rem;
}

.card-header {
    width: 100%;
    height: 3.5rem;
    background: $background;
}

.card-header-title {
    color: $color;
    position: relative;
    display: block;
    font-size: 0.85rem;
    height: 100%;
    //   font-weight: 600;
    text-decoration: none;
    display: flex;
    align-items: center;
}

.card-header-title:hover {
    color: $hoverColor;
}


.fas,
.far {
    font-size: 1.25rem;
    width: 4rem;
    text-align: center;
    flex-shrink: 0;
}

div.is-active .card-header {
    box-shadow: inset 5px 0 0 $hoverBackground;
    color: $activeColor;
    background: $activeBackground;
}


div .card-header:hover {
    color: $hoverColor;
    background: $hoverBackground !important;
}

div.is-active .card-header {
    box-shadow: inset 5px 0 0 $hoverBackground;
    color: $activeColor;
    background: $activeBackground;
}



.card-header-icon {
    color: $color;
}
</style>
