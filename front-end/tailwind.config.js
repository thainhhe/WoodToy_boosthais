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
        // Animation cho hiệu ứng trôi nổi
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        // Áp dụng animation trôi nổi
        float: "float 4s ease-in-out infinite",
      },
      // Thêm hiệu ứng drop shadow để tạo glow
      dropShadow: {
        glow: [
          "0 0 8px rgba(255, 255, 255, 0.7)",
          "0 0 15px rgba(255, 255, 255, 0.5)",
        ],
      },
    },
  },
  plugins: [],
};
