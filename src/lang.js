import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

export default new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    'en': require('./locales/json/en.i18n.json'),
    'fr': require('./locales/json/fr.i18n.json')
  }
});

export const changeLanguageMixin = {
  methods: {
    changeLanguage(language) {
      language = language || this.$i18n.fallbackLocale;
      let locale = language.toLowerCase();
      this.$i18n.locale = locale;
      this.$moment.locale(locale);
    }
  }
};
