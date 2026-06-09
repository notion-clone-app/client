import 'i18next';
import common from './locales/en/landing.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: {
            landing: typeof common;
        };
    }
}
