import {createI18n} from "vue-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

/**
 * Translations of every bounded context (merged from the Angular files of
 * `public/i18n/{lang}/`). Spanish is the initial language.
 */
const i18n = createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'en',
    messages: { en, es }
});

export default i18n;
