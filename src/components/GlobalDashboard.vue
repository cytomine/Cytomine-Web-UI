<template>
	<div id="global-dashboard">

		<h1 class="page-title">{{ $t('title-global-dashboard') }}</h1>

		<div class="tile is-ancestor">
			<div class="tile">
				<div class="tile is-parent is-7">
					<div class="tile is-child box">
						<h2>{{$t("quick-access")}}</h2>
						<div class="columns">
							<div class="column">
								<b-field>
									<b-autocomplete
										expanded
										v-model="searchProject"
										:data="filteredProjects"
										field="name"
										:placeholder="$t('project')"
										@select="option => selectedProject = option">
									<template slot="empty">{{$t('no-project')}}</template>
								</b-autocomplete>
								<p class="control">
									<button class="button">{{$t('button-go')}}</button>
								</p>
							</b-field>
						</div>

						<div class="column">
							<b-field>
								<b-autocomplete
									expanded
									v-model="searchImage"
									:data="filteredImages"
									field="originalFilename"
									:placeholder="$t('image')"
									@select="option => selectedImage = option">
								<template slot="empty">{{$t('no-image')}}</template>
							</b-autocomplete>
							<p class="control">
								<button class="button">{{$t('button-go')}}</button>
							</p>
						</b-field>
					</div>
				</div>
			</div>
		</div>
		<div class="tile is-parent">
			<div class="tile is-child box">
				<h2> {{ $t("statistics") }} </h2>
				<ul>
					<li><strong>{{projects.length}}</strong> {{$t('projects')}}</li>
					<li><strong>{{images.length}}</strong> {{$t('images')}}</li>
					<li><strong>{{nbUserAnnots}}</strong> {{$t('user-annotations')}}</li>
					<li><strong>{{nbJobAnnots}}</strong> {{$t('job-annotations')}}</li>
					<li><strong>{{nbReviewed}}</strong> {{$t('reviewed-annotations')}}</li>
				</ul>
			</div>
		</div>
	</div>
</div>

<div class="tile is-ancestor">
	<div class="tile">
		<div class="tile is-parent is-3">
			<div class="tile is-child box">
				<h2>{{$t('recent-projects')}}</h2>
				<ul>
					<li v-for="project in recentProjects" :key="project.id">
						<a :href="project.id">{{project.name}}</a>
					</li>
				</ul>
			</div>
		</div>
		<div class="tile is-parent">
			<div class="tile is-child box">
				<h2> {{$t('recent-images')}} </h2>
				<div class="columns">
					<div class="column" v-for="image in recentImages" :key="image.id">
						<div class="card">
							<div class="card-image recent-image" :style="'background-image: url(' + image.thumb + ')'">
							</div>
							<div class="card-content">
								<div class="content">
									<router-link :to="{ name: 'image', params: {id: image.id} }">
										{{ image.instanceFilename }}
									</router-link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
	name: 'global-dashboard',
	props: {
		nb_recent: {
			type: Number,
			default: 5
		}
	},
	data() {
		return {
			projects: [],
			recentProjectsId: [],
			images: [],
			recentImages: [],
			searchProject: "",
			selectedProject: null,
			searchImage: "",
			selectedImage: null,
			nbProjects: 0,
			nbImages: 0,
			nbUserAnnots: 0,
			nbJobAnnots: 0,
			nbReviewed: 0
		};
	},
	computed: {
		filteredProjects() {
			return this.projects.filter((project) => {
				return project.name.toString().toLowerCase().indexOf(this.searchProject.toLowerCase()) >= 0;
			})
		},
		filteredImages() {
			return this.images.filter((image) => {
				return image.originalFilename.toString().toLowerCase().indexOf(this.searchImage.toLowerCase()) >= 0;
			})
		},
		recentProjects() {
			return this.projects.filter(project => this.recentProjectsId.includes(project.id));
		},
		...mapState(['currentUser'])
	},
	created() {
		axios.get("/api/user/" + this.currentUser.id + "/imageinstance/light.json")
		.then(function(response) {
			this.images = response.data.collection;
		}.bind(this))

		axios.get("/api/user/" + this.currentUser.id + "/userannotation/count.json")
		.then(function(response) {
			this.nbUserAnnots = response.data.total;
		}.bind(this))

		// TODO: job annots

		axios.get("/api/user/" + this.currentUser.id + "/reviewedannotation/count.json")
		.then(function(response) {
			this.nbReviewed = response.data.total;
		}.bind(this))


		axios.get("/api/project.json")
		.then(function(response) {
			this.projects = response.data.collection;
		}.bind(this));

		axios.get("/api/project/method/lastopened.json?max=" + this.nb_recent)
		.then(function(response) {
			let listRecent = response.data.collection
			this.recentProjectsId = listRecent.map(recent => recent.id);
		}.bind(this));

		axios.get("/api/imageinstance/method/lastopened.json?max=" + this.nb_recent)
		.then(function(response) {
			this.recentImages = response.data.collection;
		}.bind(this));

		axios.get("/api/imageinstance/method/lastopened.json?max=" + this.nb_recent)
		.then(function(response) {
			this.recentImages = response.data.collection;
		}.bind(this));
	}
}
</script>

<style scoped>
#global-dashboard {
	padding: 10px 40px 20px 40px;
}


.db-quick-access {
	display: flex;
	justify-content: space-around;
}

.recent-image {
	width: 100%;
	min-height: 15vh;
	background-repeat: no-repeat;
	background-position: center center;
	background-size: cover;
	position: relative;
	border-bottom: 1px solid #ddd;
}

.card-content a {
	font-weight: bold;
}
</style>
