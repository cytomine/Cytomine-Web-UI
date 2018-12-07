<template>
<p v-if="users && users.length">
    <span v-for="(user, index) in usersToDisplay" v-if="user != null" :key="user.id">
            <username :user="user" :online="isOnline(user.id)"></username><template v-if="index < usersToDisplay.length - 1">, </template>
    </span>
    <button class="button is-small" @click="expanded=!expanded" v-if="tooManyUsers">{{ expanded ? $t("button-less") : $t("button-more")}}</button>
</p>
<p v-else>
    -
</p>
</template>

<script>
import Username from "./Username";
export default {
    name: "list-usernames",
    components: {Username},
    props: {
        users: {
            type: Array
        },
        onlines: {
            type: Array
        },
        nbDisplayed: {
            type: Number,
            default: 5
        }
    },
    data() {
        return {
            expanded: false
        };
    },
    computed: {
        tooManyUsers() {
            return this.users && this.users.length > this.nbDisplayed;
        },
        usersToDisplay() {
            if(!this.tooManyUsers || this.expanded || this.nbDisplayed == 0) {
                return this.users;
            }
            else {
                return this.users.slice(0, this.nbDisplayed);
            }
        }
    },
    methods: {
        isOnline(id) {
            if(this.onlines == null) {
                return null;
            }

            return this.onlines.find(online => online.id == id) != null;
        }
    }
};
</script>

<style scoped>
.button {
    line-height: initial;
    height: initial;
    margin-left: 5px;
}
</style>
