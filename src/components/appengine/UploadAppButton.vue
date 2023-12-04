<template>
    <div>
        <input type="file" ref="fileInput" style="display: none;" @change="handleFileChange" />
        <button id="app-upload-btn" class="button is-primary is-medium" @click="uploadTask">{{ $t(btnFunc) }}</button>
    </div>
</template>
    
<script>
import Task from '@/utils/appengine/task';

export default {
    name: 'UploadAppButton',
    props: {
        btnFunc: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            task: null,
        };
    },
    async created() {

    },
    methods: {
        handleFileChange(event) {
            const file = event.target.files[0];
            this.upload(file);
        },
        async uploadTask() {
            this.$refs.fileInput.click();
        },
        async upload(file) {
            console.log('Before uploadTask');

            const formData = new FormData();
            formData.append('task', file);

            try {
                const response = await Task.uploadTask(formData);

                if (response.status >= 200 && response.status < 300) {
                    // Successful response handling
                    const responseMsg = response.data.message || 'Unknown message'; // Accessing the 'data' property from the response object

                    console.log('Upload response:', responseMsg);
                    this.$notify({ type: 'success', text: responseMsg });
                }
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    const errorMessage = error.response.data.message || 'Task already exists!';
                    
                    console.error('Error during upload:', error);
                    this.$notify({ type: 'warn', text: errorMessage });
                } else {
                    console.error('Error during upload:', error);
                    this.$notify({ type: 'error', text: this.$t('notif-warn-appengine-upload-failed') });
                }
            }

            console.log('After upload');
        },
    },
};
</script>

<style scoped></style>
