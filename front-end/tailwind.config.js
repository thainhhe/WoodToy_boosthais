/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "sans-serif"],
      },
      colors: {
        "brand-primary": "#2A2A4E", // Màu xanh đậm
        "brand-secondary": "#F46A5E", // Màu cam/đỏ
        "brand-light": "#FFF8F2", // Màu nền sáng
        "brand-text": "#4F4F4F", // Màu chữ chính
      },
      // Thêm keyframes và animation
      keyframes: {
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};
