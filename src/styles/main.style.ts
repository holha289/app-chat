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

const classBg = {
    primary: `bg-[#3E5F44]`,
    secondary: `bg-[#5E936C]`,
    thirdary: `bg-[#93DA97]`,
    fourdary: `bg-[#E8FFD7]`,
    white: `bg-[#FFFFFF]`,
    black: `bg-[#000000]`,
}

const classText = {
    primary: `text-[#3E5F44]`,
    secondary: `text-[#5E936C]`,
    thirdary: `text-[#93DA97]`,
    fourdary: `text-[#E8FFD7]`,
    white: `text-[#FFFFFF]`,
    black: `text-[#000000]`,
}

// tiêu đề dùng dùng font 30px, subtitle dùng font 16px, các nút dùng font 16px
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

// các nút định dạng màu và kiểu dáng
const classBtn = {
    primary: ['bg-green-700', 'text-white', 'rounded-xl', 'items-center', 'h-12', 'justify-center'].join(' '),
    secondary: ['bg-white', 'border', 'border-green-600', 'text-green-600', 'rounded-xl', 'items-center', 'h-12', 'justify-center'].join(' '),
    disabled: ['bg-gray-300', 'text-gray-500', 'rounded-xl', 'items-center', 'h-12', 'justify-center'].join(' '),
    danger: ['bg-red-500', 'text-white', 'rounded-xl', 'items-center', 'h-12', 'justify-center'].join(' '),
    success: ['bg-green-500', 'text-white', 'rounded-xl', 'items-center', 'h-12', 'justify-center'].join(' '),
    outline: ['border', 'border-green-600', 'text-green-600', 'rounded-xl', 'items-center', 'h-12', 'justify-center'].join(' '),
    text: ['text-green-600', 'rounded-xl', 'items-center', 'h-12', 'justify-center'].join(' '),
    link: ['text-green-600', 'underline', 'rounded-xl', 'items-center', 'h-12', 'justify-center'].join(' '),
    none: ['items-center', 'h-12', 'justify-center'].join(' '),
    primaryText: ['text-white', 'text-base', 'font-semibold'].join(' '),
    secondaryText: ['text-green-600', 'text-base', 'font-semibold'].join(' '),
    disabledText: ['text-gray-500', 'text-base', 'font-semibold'].join(' '),
    dangerText: ['text-white', 'text-base', 'font-semibold'].join(' '),
    successText: ['text-white', 'text-base', 'font-semibold'].join(' '),
    outlineText: ['text-green-600', 'text-base', 'font-semibold'].join(' '),
    textText: ['text-green-600', 'text-base', 'font-semibold'].join(' '),
    linkText: ['text-green-600', 'text-base', 'font-semibold'].join(' '),
    noneText: ['text-green-600', 'text-base', 'font-semibold'].join(' '),
}


export { colors, classFontSize, classBtn, classBg, classText };