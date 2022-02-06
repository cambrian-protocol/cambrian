import { deepMerge } from 'grommet/utils'
import { grommet } from 'grommet'

const colors: any = {
    brand: {
        light: '#799AB8',
        dark: '#799AB8',
    },
    active: '#799AB850',
    'background-back': { dark: '#212121', light: '#EFEFEF' },
    'background-front': {
        dark: '#2f2f2f',
        light: '#FFFFFF',
    },
    'background-contrast': {
        dark: '#FFFFFF08',
        light: '#11111108',
    },
    'background-popup': { dark: '#262626', light: '#EFEFEF' },
    'primary-gradient':
        'linear-gradient(129.92deg, #2B5466 11.73%, #799AB8 79.76%)',
    'secondary-gradient':
        'linear-gradient(138.58deg, #132124 16.84%, #3F4C55 81.09%)',
    'accent-1': '#003457',
    'accent-2': '#0064a4',
}

// TODO Button primary, secondary
export const cpTheme = deepMerge(grommet, {
    defaultMode: 'dark',
    global: {
        colors,
        font: {
            family: 'Roboto, sans-serif;',
            size: '12px',
        },
        input: {
            weight: 'normal',
        },
        elevation: {
            dark: {
                none: 'none',
                xsmall: '0px 2px 2px rgba(0, 0, 0, 0.40)',
                small: '0px 4px 4px rgba(0, 0, 0, 0.40)',
                medium: '0px 6px 8px rgba(0, 0, 0, 0.40)',
                large: '0px 8px 16px rgba(0, 0, 0, 0.40)',
                xlarge: '0px 10px 24px rgba(0, 0, 0, 0.40)',
            },
        },
    },
    paragraph: {
        small: {
            size: '12px',
            height: '18px',
            maxWidth: '306px',
        },
        medium: {
            size: '14px',
            height: '20px',
            maxWidth: '336px',
        },
    },
    button: {
        primary: { color: 'primary-gradient' },
        padding: { vertical: '13px' },
        border: {
            radius: '14px',
        },
    },
    formField: {
        label: {
            margin: {
                horizontal: 'none',
            },
            size: 'small',
            requiredIndicator: true,
        },
        error: {
            size: 'small',
        },
    },
    meter: {
        color: 'brand',
    },
    layer: {
        overlay: { background: 'none' },
        container: { elevation: 'large' },
    },
})
