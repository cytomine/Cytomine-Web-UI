<template>
<div class="hotkeys-wrapper">
    <b-modal :active="active" @close="$emit('update:active', false)" :has-modal-card="true">
        <form>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">{{$t("hotkeys")}}</p>
                </header>
                <section class="modal-card-body">
                    <div class="columns">
                        <div class="column">
                            <h2>{{$t("view")}}</h2>
                            <ul>
                                <li><i class="key fas fa-arrow-up"></i>{{$t("hotkey-move-up")}}</li>
                                <li><i class="key fas fa-arrow-left"></i>{{$t("hotkey-move-left")}}</li>
                                <li><i class="key fas fa-arrow-right"></i>{{$t("hotkey-move-right")}}</li>
                                <li><i class="key fas fa-arrow-down"></i>{{$t("hotkey-move-down")}}</li>
                                <li><i class="key fas fa-plus"></i>{{$t("hotkey-zoom-in")}}</li>
                                <li><i class="key fas fa-minus"></i>{{$t("hotkey-zoom-out")}}</li>
                                <li><span class="key">n</span> {{$t("hotkey-next-image")}}</li>
                                <li><span class="key">p</span> {{$t("hotkey-previous-image")}}</li>
                            </ul>
                        </div>
                        <div class="column">
                            <h2>{{$t("draw")}}</h2>
                            <ul>
                                <li><span class="key">s</span> {{$t("hotkey-select")}}</li>
                                <li><span class="key">o</span> {{$t("hotkey-point")}}</li>
                                <li><span class="key">f</span> {{$t("hotkey-freehand")}}</li>
                                <li><span class="key">d</span> {{$t("hotkey-delete")}}</li>
                                <li><span class="key">Ctrl + Z</span> {{$t("hotkey-undo")}}</li>
                                <li><span class="key">Ctrl + Y</span> {{$t("hotkey-redo")}}</li>
                            </ul>
                        </div>
                        <div class="column">
                            <h2>{{$t("review")}}</h2>
                            <ul>
                                <!-- TODO -->
                            </ul>
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-link" type="button" @click="$emit('update:active', false)">
                        {{$t("button-close")}}
                    </button>
                </footer>
            </div>
        </form>
    </b-modal>
</div>
</template>

<script>
export default {
    name: "hotkeys-modal",
    props: ["active"]
};
</script>

<style scoped>
.hotkeys-wrapper {
    font-weight: normal;
}

.key {
    min-width: 40px;
    height: 30px;
    border: 1px solid #ddd;
    padding: 5px 10px !important;
    margin: 0px 10px 8px 0px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 3px;
    color: #888;
    background: #f8f8f8;
    font-weight: 600;
}

.key.fas {
    font-size: 16px;
}
</style>

<style>
.hotkeys-wrapper .modal-card, .hotkeys-wrapper .modal-card-body {
    width: 50vw;
    min-width: 600px;
}
</style>
