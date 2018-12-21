<template>
<div class="buttons">
    <button class="button" :class="size">{{$t("button-rename")}}</button> <!-- TODO -->
    <button class="button" :class="size">{{$t("button-lock")}}</button> <!-- TODO -->
    <button class="button is-danger" :class="size" @click="deleteProject()">{{$t("button-delete")}}</button>
</div>
</template>

<script>
export default {
    name: "project-actions",
    props: {
        project: {type: Object},
        size: {type: String, default: "is-small"}
    },
    methods: {
        deleteProject() {
            this.$dialog.confirm({
                title: this.$t("delete-project"),
                message: this.$t("delete-project-confirmation-message", {projectName: this.project.name}),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.$emit("delete")
            });
        }
    }
};
</script>