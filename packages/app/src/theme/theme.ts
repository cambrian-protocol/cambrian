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
    background: '#000000',
    veryDark: '#0e0e0e',
    darkBlue:
        'linear-gradient(167deg, rgba(31,31,45,1) 0%, rgba(16,54,57,1) 80%)',
    selected:
        'linear-gradient(167deg, rgba(100,161,168,1) 0%, rgba(44,72,74,1) 80%)',
    brandGradient:
        'linear-gradient(167deg, rgba(198,237,241,1) 0%, rgba(79,163,172,1) 80%)',
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
    rangeInput: {
        thumb: {
            color: 'brand',
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
