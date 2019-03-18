<template>
<div class="project-actions-wrapper">
    <b-modal :active="isRenameModalActive" has-modal-card @close="isRenameModalActive = false">
        <form>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">{{$t("rename-project")}}</p>
                </header>
                <section class="modal-card-body">
                    <b-field :label="$t('new-name')"
                             :type="emptyNewName ? 'is-danger' : null"
                             :message="emptyNewName ? $t('field-cannot-be-empty') : ''">
                        <b-input v-model="newName"></b-input>
                    </b-field>
                </section>
                <footer class="modal-card-foot">
                    <button class="button" type="button" @click="isRenameModalActive = false">
                        {{$t("button-cancel")}}
                    </button>
                    <button class="button is-link" @click="rename()" :disabled="emptyNewName">
                        {{$t("button-save")}}
                    </button>
                </footer>
            </div>
        </form>
    </b-modal>

    <div class="buttons">
        <button class="button" :class="size" @click="isRenameModalActive = true">
            {{$t("button-rename")}}
        </button>
        <button class="button is-danger" :class="size" @click="deleteProject()">
            {{$t("button-delete")}}
        </button>
    </div>
</div>
</template>

<script>
export default {
    name: "project-actions",
    props: {
        project: {type: Object},
        size: {type: String, default: "is-small"}
    },
    data() {
        return {
            isRenameModalActive: false,
            newName: ""
        };
    },
    computed: {
        emptyNewName() {
            return this.newName.length == 0;
        }
    },
    watch: {
        isRenameModalActive(val) {
            if(val) {
                this.newName = this.project.name;
            }
        },
    },
    methods: {
        async rename() {
            let oldName = this.project.name;
            try {
                this.project.name = this.newName;
                await this.project.save();
                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-project-rename", {projectName: this.project.name})
                });
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-project-rename", {projectName: oldName})
                });
            }
            this.isRenameModalActive = false;
        },

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