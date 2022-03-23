import { deepMerge } from 'grommet/utils'
import { grommet } from 'grommet'

const colors: any = {
    brand: {
        light: '#4e94bd',
        dark: '#4e94bd',
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
    'accent-1': '#2d3a41',
    'accent-2': '#0064a4',
}

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
        drop: {
            background: 'background-front',
            border: { radius: '10px' },
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
        default: {
            color: 'white',
            padding: {
                vertical: '12px',
                horizontal: '24px',
            },
        },
        border: {
            radius: '10px',
        },
        primary: {
            background: { color: 'brand' },
            color: 'white',
            padding: {
                vertical: '12px',
                horizontal: '24px',
            },
        },
        secondary: {
            background: { color: 'accent-1' },
            padding: {
                vertical: '12px',
                horizontal: '24px',
            },
        },
        hover: { background: { color: '#3F4C55' } },
        size: {
            small: {
                border: {
                    radius: '10px',
                },
            },
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
    checkBox: {
        color: 'white',
        border: {
            width: '1px',
        },
        check: {
            thickness: '2px',
        },
    },
    select: {
        icons: {
            color: 'white',
        },
    },
})
