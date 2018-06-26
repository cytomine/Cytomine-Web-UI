<template>
	<div>
		{{$t("imageExplorer.image")}} {{ $route.params.id }}
		<input class="input" type="text" v-model="top">
		<input class="input" type="text" v-model="left">
		<button @click="$destroy()">Close</button>
	</div>
</template>

<script>
export default {
	name: "CytomineImage",
	data() {
		return {
			top: 0,
			left: 0,
			imageId: 0
		};
	},
	mounted() {
		this.imageId = this.$route.params.id;
	}
}
</script>

<style>
</style>
