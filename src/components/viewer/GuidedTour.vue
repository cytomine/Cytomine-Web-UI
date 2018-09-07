<!-- TODO: implement in backend -->

<template>
<div>
    <h1>{{ $t("guided-tour") }}</h1>
    <ul>
        <li v-for="(pos, index) in positions" :key="pos.name"><a @click="goToPosition(index)">{{pos.name}}</a></li>
    </ul>
    <div class="buttons has-addons">
        <button class="button" @click="previousPosition()" :disabled="curPosition <= 0"> {{ $t("button-previous") }} </button>
        <button class="button" @click="nextPosition()" :disabled="curPosition >= positions.length - 1"> {{ $t("button-next") }} </button>
    </div>
</div>
</template>

<script>
export default {
    name: "guided-tour",
    props: ["view"],
    data() {
        return {
            positions: [
                {name: "Punch 1", position: [38026, 236809], zoom:7},
                {name: "Punch 2", position: [50263, 236809], zoom:7},
                {name: "Punch 5", position: [64604, 262550], zoom:5}
            ],
            curPosition: -1,
        };
    },
    methods: {
        nextPosition() {
            if(this.curPosition < this.positions.length) {
                let data = this.positions[++this.curPosition];
                this.flyTo(data.position, data.zoom);
            }
        },

        previousPosition() {
            if(this.curPosition > 0) {
                let data = this.positions[--this.curPosition];
                this.flyTo(data.position, data.zoom);
            }
        },

        goToPosition(pos) {
            this.curPosition = pos;
            let data = this.positions[pos];
            this.flyTo(data.position, data.zoom);
        },

        flyTo(location, targetZoom, duration=2000) {
            let interZoom = Math.min(targetZoom, this.view.getZoom()) - 1;

            this.view.animate({
                center: location,
                duration: duration
            });

            this.view.animate(
                {
                    zoom: interZoom,
                    duration: duration / 2
                },
                {
                    zoom: targetZoom,
                    duration: duration / 2
                }
            );
        },
    }
};
</script>
