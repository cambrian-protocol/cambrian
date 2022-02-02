const isObject = (item: any) =>
    item && typeof item === 'object' && !Array.isArray(item)

const deepFreeze = (obj: any) => {
    Object.keys(obj).forEach(
        (key) => key && isObject(obj[key]) && Object.freeze(obj[key])
    )
    return Object.freeze(obj)
}

const accentColors = ['#23A6f0', '#614767', '#810E21', '#FF8D35']
const neutralColors = ['#EBF2EA', '#F0E8E7', '#80746E', '#767676']
const darkColors = [
    '#333333',
    '#555555',
    '#777777',
    '#999999',
    '#999999',
    '#999999',
]
const lightColors = [
    '#F8F8F8',
    '#F2F2F2',
    '#EDEDED',
    '#DADADA',
    '#DADADA',
    '#DADADA',
]
const statusColors: any = {
    critical: '#b70014',
    error: '#FA0606',
    warning: '#FFD144',
    ok: '#27AE60',
    unknown: '#CCCCCC',
    disabled: '#CCCCCC',
}

const colors: any = {
    brand: {
        light: '#63b1ba',
        dark: '#63b1ba',
    },
    background: '#212121',
    veryDark: '#0e0e0e',
    darkBlue:
        'linear-gradient(167deg, rgba(31,31,45,1) 0%, rgba(16,54,57,1) 80%)',
    selected:
        'linear-gradient(167deg, rgba(100,161,168,1) 0%, rgba(44,72,74,1) 80%)',
    brandGradient:
        'linear-gradient(167deg, rgba(198,237,241,1) 0%, rgba(79,163,172,1) 80%)',
    primaryGradient:
        'linear-gradient(129.92deg, #2B5466 11.73%, #799AB8 79.76%)',
    secondaryGradient:
        'linear-gradient(138.58deg, #132124 16.84%, #3F4C55 81.09%)',
    itemHighlight: 'rgba(122, 122, 122, 0.16)',
}

export const cpTheme = deepFreeze({
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
        color: 'black',
        primary: {
            color: colors.brandGradient,
        },
        border: {
            color: colors.brand.light,
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
})
