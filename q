[1mdiff --git a/src/components/admin/UserModal.vue b/src/components/admin/UserModal.vue[m
[1mindex 6ca30625..05534890 100644[m
[1m--- a/src/components/admin/UserModal.vue[m
[1m+++ b/src/components/admin/UserModal.vue[m
[36m@@ -60,6 +60,12 @@[m
       </b-select>[m
     </b-field>[m
 [m
[32m+[m[32m    <b-field horizontal v-if="isChangingRoleToAdmin()">[m
[32m+[m[32m      <b-checkbox v-model="confirmAdmin">[m
[32m+[m[32m        {{$t('admin-warning')}}[m
[32m+[m[32m      </b-checkbox>[m
[32m+[m[32m    </b-field>[m
[32m+[m
     <b-field :label="$t('language')" horizontal>[m
       <b-select v-model="internalUser['language']">[m
         <option v-for="{value, name} in languages" :key="value" :value="value">[m
[36m@@ -79,7 +85,7 @@[m
       <button class="button" type="button" @click="$emit('update:active', false)">[m
         {{$t('button-cancel')}}[m
       </button>[m
[31m-      <button class="button is-link" :disabled="errors.any()">[m
[32m+[m[32m      <button class="button is-link" :disabled="errors.any() || !isAdminConfirmed()">[m
         {{$t('button-save')}}[m
       </button>[m
     </template>[m
[36m@@ -109,6 +115,7 @@[m [mexport default {[m
       rolesWithIds: null,[m
       selectedRole: defaultRole,[m
       displayErrors: false,[m
[32m+[m[32m      confirmAdmin: false,[m
       languages: [[m
         {value: 'EN', name:'English'},[m
         {value: 'FR', name:'Français'},[m
[36m@@ -151,10 +158,22 @@[m [mexport default {[m
         this.selectedRole = this.user ? this.user.role : defaultRole;[m
         this.internalUser.language = this.user ? this.user.language : defaultLanguage.value;[m
         this.displayErrors = false;[m
[32m+[m[32m        this.confirmAdmin = false;[m
       }[m
     }[m
   },[m
   methods: {[m
[32m+[m[32m    isChangingRoleToAdmin() {[m
[32m+[m[32m      let currentRole = this.user ? this.user.role : defaultRole;[m
[32m+[m[32m      return this.isNotAdmin(currentRole) && !this.isNotAdmin(this.selectedRole);[m
[32m+[m[32m    },[m
[32m+[m[32m    isNotAdmin(role){[m
[32m+[m[32m      return role != 'ROLE_ADMIN' && role != 'ROLE_SUPER_ADMIN';[m
[32m+[m[32m    },[m
[32m+[m[32m    isAdminConfirmed(){[m
[32m+[m[32m      return  this.confirmAdmin || !this.isChangingRoleToAdmin();[m
[32m+[m[32m    },[m
[32m+[m[41m    [m
     async save() {[m
       let result = await this.$validator.validateAll();[m
       if(!result) {[m
[1mdiff --git a/src/locales/translations.csv b/src/locales/translations.csv[m
[1mindex 7f0b3dc3..dfae49f9 100644[m
[1m--- a/src/locales/translations.csv[m
[1m+++ b/src/locales/translations.csv[m
[36m@@ -428,6 +428,7 @@[m [mopen-admin-session,Open admin session,Ouvrir une session admin,Abrir sesión de[m
 close-admin-session,Close admin session,Fermer la session admin,Cerrar sesión de administrador[m
 admin,Admin,Admin,Admin[m
 admin-menu,Admin,Administration,Administración[m
[32m+[m[32madmin-warning, I confirm that I want to make this user an admin., Je confirme que je veux faire de cet utilisateur un administrateur., Confirmo que quiero hacer de este usuario un administrador.[m
 page-not-found,Page not found,Page non trouvée,Página no encontrada[m
 not-found,Not found,Introuvable,No encontrado[m
 not-found-error,The requested resource could not be loaded,La ressource demandée n'a pas pu être chargée,El recurso solicitado no se pudo cargar[m
