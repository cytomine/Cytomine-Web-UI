<template>
<div class="modal-card">
  <header class="modal-card-head">
    <p class="modal-card-title">{{$t('annotation-comments')}}</p>
  </header>
  <section class="modal-card-body">
    <div v-if="!comments || !comments.length">
      <em class="has-text-grey">
        {{$t('no-annotation-comments')}}
      </em>
      <hr>
    </div>
    <template v-else>
      <div class="comments-wrapper">
        <div v-for="comment in comments" :key="comment.id">
          <p class="comment-sender is-size-7">
            <strong>{{ comment.senderName }}</strong>
            <span class="has-text-grey">{{Number(comment.created) | moment('ll LT')}}</span>
          </p>
          <p class="comment-content">{{comment.comment}}</p>
          <hr>
        </div>
      </div>
    </template>

    <div v-show="!addingComment" class="has-text-centered">
      <button class="button is-link" @click="addingComment = true">{{$t('button-add-comment')}}</button>
    </div>

    <div v-show="addingComment">
      <h2>{{$t('add-new-comment')}}</h2>
      <b-message type="is-info" has-icon size="is-small">
        {{$t('comment-will-be-sent-by-email')}}
      </b-message>
      <b-field>
        <b-radio v-model="sendToAllMembers" :native-value="true">
          {{$t('send-to-all-project-members')}}
        </b-radio>
      </b-field>
      <b-field>
        <b-radio v-model="sendToAllMembers" :native-value="false">
          {{$t('send-to-some-members')}}
        </b-radio>
      </b-field>
      <b-field v-if="!sendToAllMembers" :type="errorSelectedMembers ? 'is-danger' : null" :message="errorSelectedMembers">
        <user-taginput v-model="selectedMembers" :users="members" />
      </b-field>
      <b-field :type="errorComment ? 'is-danger' : null" :message="errorComment">
        <b-input v-model="text" type="textarea" :placeholder="$t('enter-comment')" rows="2" />
      </b-field>
      <p class="buttons is-right are-small">
        <button class="button" @click="addingComment = false" :disabled="loading">
          {{$t('button-cancel')}}
        </button>
        <button class="button is-link" :class="{'is-loading': loading}"
          :disabled="loading || errorComment || errorSelectedMembers" @click="share()">
          {{$t('button-share')}}
        </button>
      </p>
    </div>

  </section>
  <footer class="modal-card-foot">
  </footer>
</div>
</template>

<script>
import {AnnotationComment} from 'cytomine-client';
import UserTaginput from '@/components/user/UserTaginput';
import {fullName} from '@/utils/user-utils.js';

export default {
  name: 'annotation-comments-modal',
  components: {
    UserTaginput
  },
  props: {
    annotation: Object,
    comments: Array
  },
  data() {
    return {
      addingComment: false,
      sendToAllMembers: true,
      selectedMembers: [],
      text: '',
      displayErrors: false,
      loading: false
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser.user;
    },
    members() { // all project members except current user
      return this.$store.state.project.members.filter(member => member.id !== this.currentUser.id);
    },
    annotationURL() {
      let uri = `project/${this.annotation.project}/image/${this.annotation.image}/annotation/${this.annotation.id}`;
      return `${window.location.origin}/#/${uri}`;
    },
    errorComment() {
      if(this.displayErrors && !this.text) {
        return this.$t('field-cannot-be-empty');
      }
    },
    errorSelectedMembers() {
      if(this.displayErrors && !this.sendToAllMembers && !this.selectedMembers.length) {
        return this.$t('field-cannot-be-empty');
      }
    }
  },
  watch: {
    addingComment() {
      this.sendToAllMembers = true;
      this.selectedMembers = [];
      this.text = '';
      this.displayErrors = false;
    }
  },
  methods: {
    async share() {
      this.displayErrors = true;
      if(this.errorComment || this.errorSelectedMembers) {
        return;
      }

      this.loading = true;
      try {
        let sender = fullName(this.currentUser);
        let newComment = await new AnnotationComment({
          annotation: this.annotation,
          subject: `Cytomine: ${sender} commented an annotation`, // not translated because the content of the mail will be in english
          from: sender,
          receivers: (this.sendToAllMembers ? this.members : this.selectedMembers).map(m => m.id),
          comment: this.text,
          annotationURL: this.annotationURL,
          shareAnnotationURL: this.annotationURL + '?action=comments'
        }).save();
        this.$emit('addComment', newComment);
        this.$notify({type: 'success', text: this.$t('notif-success-new-comment')});
        this.addingComment = false;
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-new-comment')});
      }
      this.loading = false;
    },
  }
};
</script>

<style scoped>
.modal-card {
  max-height: 80vh;
}

.modal-card-body {
  display: flex;
  flex-direction: column;
}

.comments-wrapper {
  overflow: auto;
  margin-bottom: 1em;
  min-height: 5em;
}

.comment-sender strong {
  margin-right: 0.5em;
}

.comment-content {
  margin-top: 0.25em;
  margin-bottom: 0.5em;
}

>>> textarea {
  margin: 0.75em 0 0;
}

hr {
  margin: 0.75em 0px !important;
}

>>> .dropdown-content {
  max-height: 7em !important;
}
</style>
