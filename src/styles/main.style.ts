const colors = {
    color1: '#93DA97',
    color2: '#3E5F44',
    color3: '#5E936C',
    color4: '#E8FFD7',
    white: '#FFFFFF',
    black: '#000000',
    primary: '#3E5F44',
    secondary: '#5E936C',
    thirdary: '#93DA97',
    fourdary: '#E8FFD7',
}

const classFontSize = {
    xs: 'text-xs', // 12px
    sm: 'text-sm', // 14px
    base: 'text-base', // 16px
    lg: 'text-lg', // 18px
    xl: 'text-xl', // 20px
    '2xl': 'text-2xl', // 24px
    '3xl': 'text-3xl', // 30px
    '4xl': 'text-4xl', // 36px
    '5xl': 'text-5xl', // 48px
}

const classBtn = {
    primary: `bg-[${colors.primary}] text-white`,
    secondary: `bg-white border border-[${colors.secondary}] text-[${colors.secondary}]`,
    disabled: `bg-gray-300 text-gray-500`,
    danger: `bg-red-500 text-white`,
    success: `bg-green-500 text-white`,
    outline: `border border-[${colors.secondary}] text-[${colors.secondary}]`,
    text: `text-[${colors.secondary}]`,
    link: `text-[${colors.secondary}] underline`,
}


export { colors, classFontSize, classBtn };