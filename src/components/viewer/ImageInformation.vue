<template>
<div>
    <h1>{{$t("information")}}</h1>
    <table class="table">
        <tbody>
            <tr>
                <td><strong>{{$t("filename")}}</strong></td>
                <td>{{image.instanceFilename}}</td>
            </tr>
            <tr>
                <td><strong>{{$t("width")}}</strong></td>
                <td>{{image.width}}</td>
            </tr>
            <tr>
                <td><strong>{{$t("height")}}</strong></td>
                <td>{{image.height}}</td>
            </tr>
            <tr>
                <td><strong>{{$t("resolution")}}</strong></td>
                <td>{{resolution}}</td>
            </tr>
            <tr>
                <td><strong>{{$t("magnification")}}</strong></td>
                <td>{{magnification}}</td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
export default {
    name: "image-information",
    props: ["image"],
    computed: {
        resolution() {
            if(this.image.resolution != null) {
                return this.image.resolution.toFixed(3);
            }
            else {
                return this.$t("unknown");
            }
        },

        magnification() {
            return this.image.magnification || this.$t("unknown");
        }
    }
};
</script>
