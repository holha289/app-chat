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
    primary: `bg-[#3E5F44] text-white rounded-xl items-center h-[50px] vertical-align-middle justify-center`,
    secondary: `bg-white border border-[#5E936C] text-[#5E936C] rounded-xl items-center h-[50px] vertical-align-middle justify-center`,
    disabled: `bg-gray-300 text-gray-500 rounded-xl items-center h-[50px] vertical-align-middle justify-center`,
    danger: `bg-red-500 text-white rounded-xl items-center h-[50px] vertical-align-middle justify-center`,
    success: `bg-green-500 text-white rounded-xl items-center h-[50px] vertical-align-middle justify-center`,
    outline: `border border-[#5E936C] text-[#5E936C] rounded-xl items-center h-[50px] vertical-align-middle justify-center`,
    text: `text-[#5E936C] rounded-xl items-center h-[50px] vertical-align-middle justify-center`,
    link: `text-[#5E936C] underline rounded-xl items-center h-[50px] vertical-align-middle justify-center`,
    none: `items-center h-[50px] vertical-align-middle justify-center`,
    primaryText: `text-white text-base font-semibold`,
    secondaryText: `text-[#5E936C] text-base font-semibold`,
    disabledText: `text-gray-500 text-base font-semibold`,
    dangerText: `text-white text-base font-semibold`,
    successText: `text-white text-base font-semibold`,
    outlineText: `text-[#5E936C] text-base font-semibold`,
    textText: `text-[#5E936C] text-base font-semibold`,
    linkText: `text-[#5E936C] text-base font-semibold`,
    noneText: `text-[#5E936C] text-base font-semibold`,
}


export { colors, classFontSize, classBtn, classBg, classText };