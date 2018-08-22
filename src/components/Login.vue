<template>
    <div class="panel login-panel">
        <p class="panel-heading">
            <i class="fa fa-user" aria-hidden="true"></i>
            {{$t("login")}}
        </p>
        <div class="panel-block">
            <form>
                <b-field :label="$t('username')">
                    <b-input v-model="username"></b-input>
                </b-field>

                <b-field :label="$t('password')">
                    <b-input type="password" v-model="password"></b-input>
                </b-field>

                <b-field>
                    <b-checkbox v-model="rememberMe" type="is-info">{{$t("remember-me")}}</b-checkbox>
                </b-field>

                <b-field grouped position="is-right">
                    <div class="control">
                        <button class="button is-link" @click="login()"> {{$t("button-save")}}</button>
                    </div>
                </b-field>
            </form>
        </div>
    </div>
</template>

<script>

export default {
    name: "login",
    data() {
        return {
            username: "",
            password: "",
            rememberMe: true
        }
    },
    methods: {
        async login() {
            try {
                await this.$store.dispatch("login", {username: this.username, password: this.password, rememberMe: this.rememberMe});
                this.$notify({type: "success", text: this.$t("notif-success-login")});
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-login")});
            }
        }
    }
}
</script>

<style>
.login-panel {
    width: 30%;
    margin: auto;
    margin-top: 50px;
}
</style>
