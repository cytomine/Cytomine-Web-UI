<template>
<b-taginput 
    :value="value"
    @input="$emit('input', $event)"
    :data="filteredUsers"
    autocomplete
    :open-on-focus="true"
    field="fullName"
    :placeholder="$t('search-user')"
    @typing="val => searchString = val"
    @add="searchString = ''"
    :allow-duplicates="false">
</b-taginput>
</template>

<script>
export default {
    name: "user-taginput",
    props: [
        "value",
        "users"
    ],
    data() {
        return {
            searchString: ""
        };
    },
    computed: {
        filteredUsers() {
            let selectedIds = this.value.map(v => v.id);
            let filtered = this.users.filter(user => !selectedIds.includes(user.id));
            if(this.searchString === "") {
                return filtered;
            }

            let str = this.searchString.toLowerCase();
            return filtered.filter(user => {
                return user.fullName.toLowerCase().indexOf(str) >= 0;
            });
        }
    }
};
</script>
