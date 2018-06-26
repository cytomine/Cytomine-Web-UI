<template>
	<div class="panel login-panel">
		<p class="panel-heading">
			<i class="fa fa-user" aria-hidden="true"></i>
			{{$t("login")}}
		</p>
		<div class="panel-block">
			<b-field :label="$t('username')">
				<b-input v-model="username"></b-input>
			</b-field>

			<b-field :label="$t('password')">
				<b-input type="password" v-model="password"></b-input>
			</b-field>

			<b-field>
				<b-checkbox :value="remember_me" type="is-info">{{$t("remember-me")}}</b-checkbox>
			</b-field>

			<b-field grouped position="is-right">
				<div class="control">
					<button class="button is-link" @click="login()"> {{$t("button-save")}}</button>
				</div>
			</b-field>
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
			remember_me: true
		}
	},
	methods: {
		login() {
			this.$store.dispatch('login', {username: this.username, password: this.password, remember_me: this.remember_me})
				.then(() => this.$notify({
					type: 'success',
					text: "Welcome on Cytomine"
				}))
				.catch(() => this.$notify({
					type: 'error',
					text: "Invalid credentials"
				}));
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
