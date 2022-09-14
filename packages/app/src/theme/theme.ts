import { deepMerge } from 'grommet/utils'
import { grommet } from 'grommet'

const colors: any = {
    brand: {
        light: '#2d7dac',
        dark: '#2d7dac',
    },
    active: '#799AB850',
    'background-back': { dark: '#040f11', light: '#ecfcff' },
    'background-front': {
        dark: '#012b39',
        light: '#76d3e6',
    },
    'background-contrast': {
        dark: '#00202b',
        light: '#b5e7f7',
    },
    'background-contrast-hover': {
        dark: '#012e3d',
        light: '#95d4e8',
    },
    'background-contrast-transparent': '#00202b70',
    'background-popup': { dark: '#132e33', light: '#0A1F23' },
    'primary-gradient':
        'linear-gradient(129.92deg, #2B5466 11.73%, #799AB8 79.76%)',
    'secondary-gradient':
        'linear-gradient(138.58deg, #132124 16.84%, #3F4C55 81.09%)',
    'accent-1': '#2d3a41',
    'accent-2': '#0064a4',
    'status-warning': '#ffdc4d',
    'status-ok': '#338233',
    'status-error': 'red',
    'dark-4': '#999999',
    'status-initiated': '#cac63d',
    'status-reported': '#2ec090',
    'status-arbitration': '#be8b32',
    'status-executed': '#59b846',
    'status-proposed': '#aca0d6',
}

export const cpTheme = deepMerge(grommet, {
    defaultMode: 'dark',
    global: {
        colors,
        font: {
            family: 'Segoe UI, sans-serif;',
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
            background: 'background-popup',
            border: { radius: '5px' },
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
    card: {
        container: {
            round: 'xsmall',
        },
    },
    button: {
        hover: {
            background: '#315e79',
        },
        default: {
            padding: {
                vertical: '12px',
                horizontal: '24px',
            },
            color: 'white',
        },
        border: {
            radius: '5px',
        },
        primary: {
            background: 'brand',
            padding: {
                vertical: '12px',
                horizontal: '24px',
            },
            extend: `
            color: white;
            box-shadow: 0px 4px 4px rgb(0 0 0 / 40%);
            white-space: nowrap;
            `,
        },
        secondary: {
            background: '#00375b',
            padding: {
                vertical: '12px',
                horizontal: '24px',
            },
            extend: `
            color: white;
            box-shadow: 0px 4px 4px rgb(0 0 0 / 40%);
            white-space: nowrap;
            `,
        },
        size: {
            small: {
                border: {
                    radius: '5px',
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
            size: 'xsmall',
            background: {
                color: { light: '#FF404033', dark: '#FF40404D' },
            },
        },
        disabled: {
            background: { color: 'none' },
        },
        border: {
            error: {
                color: 'border',
            },
            color: 'border',
            side: 'all',
        },
        round: 'xsmall',
    },
    meter: {
        color: 'brand',
    },
    layer: {
        border: { radius: 'small' },
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
    spinner: {
        container: {
            pad: 'none',
            size: '20px',
        },
    },
    tab: {
        color: colors['dark-4'],
        border: {
            side: 'bottom',
            color: 'border',
            active: {
                color: 'brand',
            },
            hover: {
                color: 'border',
            },
        },
        hover: {
            background: 'background-front',
            color: 'white',
            extend: 'border-radius: 5px 5px 0px 0px ;',
        },
        pad: { bottom: 'small', top: 'small', horizontal: 'medium' },
        margin: {
            horizontal: 'none',
        },
        active: { color: 'white' },
    },
    accordion: { border: { color: 'transparent' } },
})
