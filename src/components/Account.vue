<template>
	<div class="account-wrapper">

		<div class="panel">
			<p class="panel-heading">
				<i class="fa fa-user" aria-hidden="true"></i>
				{{ $t('profile') }}
			</p>
			<div class="panel-block">
				<b-field :label="$t('username')" horizontal>
					<b-input :value="currentUser.username" disabled></b-input>
				</b-field>

				<b-field :label="$t('lastname')" horizontal>
					<b-input v-model="lastname"></b-input>
				</b-field>

				<b-field :label="$t('firstname')" horizontal>
					<b-input v-model="firstname"></b-input>
				</b-field>

				<b-field :label="$t('email')" horizontal>
					<b-input v-model="email"></b-input>
				</b-field>

				<b-field grouped position="is-right">
					<div class="control">
						<button class="button is-link" @click="editDetails"> {{$t("button-save")}}</button>
					</div>
				</b-field>
			</div>
		</div>

		<div class="panel">
			<p class="panel-heading">
				<i class="fa fa-briefcase" aria-hidden="true"></i>
				{{ $t('password') }}
			</p>
			<div class="panel-block">
				<b-field :label="$t('password-current')" horizontal>
					<div class="control">
						<input class="input" type="password" :class="{'is-success': correctPassword}" v-model="currentPassword">
					</div>
				</b-field>

				<b-field :label="$t('password-new')" horizontal>
					<b-input type="password" v-model="newPassword" :disabled="!correctPassword"></b-input>
				</b-field>

				<b-field :label="$t('password-confirm')" horizontal>
					<b-input type="password" v-model="confirmPassword" :disabled="newPassword == ''"></b-input>
				</b-field>

				<b-field grouped position="is-right">
					<div class="control">
						<button class="button is-link" :disabled="savePasswordDisabled" @click="savePassword">
							{{$t("button-save")}}
						</button>
					</div>
				</b-field>
			</div>
		</div>

		<div class="panel"> <!-- TODO: remove ? or only show for technical users ? -->
			<p class="panel-heading">
				<i class="fa fa-exchange" aria-hidden="true"></i>
				{{ $t('api-keys') }}
			</p>
			<div class="panel-block">

				<b-field :label="$t('public-key')" horizontal>
					<b-input :value="currentUser.publicKey" readonly></b-input>
				</b-field>

				<b-field :label="$t('private-key')" horizontal>
					<b-input :value="currentUser.privateKey" readonly></b-input>
				</b-field>

				<b-field grouped position="is-right">
					<div class="control">
						<button class="button is-link">{{$t('regenerate-api-keys')}}</button>
					</div>
				</b-field>

			</div>
		</div>
	</div>

</template>

<script>
import { mapState } from 'vuex';
import _ from 'lodash';

export default {
	name: "Account",
	data() {
		return {
			firstname: this.$store.state.currentUser.firstname,
			lastname: this.$store.state.currentUser.lastname,
			email: this.$store.state.currentUser.email,
			currentPassword: "",
			correctPassword: false,
			newPassword: "",
			confirmPassword: ""
		}
	},
	computed: {
		savePasswordDisabled() {
			return !(this.newPassword == this.confirmPassword && this.newPassword != '');
		},
		...mapState(['currentUser'])
	},
	watch: {
		currentPassword() {
			this.debouncedCheckPassword();
		}
	},
	created() {
		this.debouncedCheckPassword = _.debounce(this.checkPassword, 250);
	},
	methods: {
		editDetails() {
			let updatedUser = JSON.parse(JSON.stringify(this.currentUser));
			updatedUser.firstname = this.firstname;
			updatedUser.lastname = this.lastname;
			updatedUser.email = this.email;
			this.$store.dispatch('updateUser', updatedUser)
			.then(() => {
				this.$notify({
					type: 'success',
					text: this.$t("notif-success-user-details-saved")
				});
			})
			.catch(() => {
				this.$notify({
					type: 'error',
					text: this.$t("notif-error-user-details-not-saved")
				});
			});

		},
		savePassword() {
			if(this.newPassword != this.confirmPassword) {
				this.$notify({
					type: 'error',
					text: "The provided passwords are not identical"
				});
			}
			else {
				let updatedUser = JSON.parse(JSON.stringify(this.currentUser));
				updatedUser.password = this.newPassword;
				this.$store.dispatch('updateUser', updatedUser).then(() => {
					this.currentPassword = '';
					this.newPassword = '';
					this.confirmPassword = '';
					this.$notify({
						type: 'success',
						text: this.$t("notif-success-password-saved")
					});
				})
				.catch(() => {
					this.$notify({
						type: 'error',
						text: this.$t("notif-error-password-not-saved")
					});
				});
			}

		},
		checkPassword() {
			if(this.currentPassword == 'password') { // TODO: change !! make API request (curretnly not possible due to CORS errors)
				this.correctPassword = true;

			}
			else {
				this.correctPassword = false;
				this.newPassword = '';
				this.confirmPassword = '';
			}
		}
	}
}
</script>

<style scoped>

.account-wrapper {
	padding: 25px;
}

.panel {
	width: 80%;
	margin: auto;
}

</style>
