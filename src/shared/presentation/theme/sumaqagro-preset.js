import {definePreset} from "@primeuix/themes";
import Material from "@primeuix/themes/material";

/**
 * Material preset with the SumaqAgro colors.
 * The Angular app used the Material 3 theme with `primary: green`; the primary
 * scale below is the M3 green tonal palette, so the main color (`700`) is the
 * same M3 tone 40 (`#006e1c`) of the Angular Material buttons and links.
 */
const SumaqAgroPreset = definePreset(Material, {
    semantic: {
        primary: {
            50: '#f0ffea',
            100: '#c9ffc0',
            200: '#88fa84',
            300: '#6bdd6b',
            400: '#4cc152',
            500: '#29a538',
            600: '#008a24',
            700: '#006e1c',
            800: '#005312',
            900: '#003909',
            950: '#002204'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.700}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.800}',
                    activeColor: '{primary.900}'
                },
                highlight: {
                    background: '#d3e8cf',
                    focusBackground: '#d3e8cf',
                    color: '#0f1f0f',
                    focusColor: '#0f1f0f'
                }
            }
        }
    }
});

export default SumaqAgroPreset;
