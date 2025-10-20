import React from "react";

const socials = [
  {
    name: "Messenger",
    url: "https://m.me/yourpageid", // Thay bằng link Messenger thực tế
    icon: <img src="/download.webp" alt="Messenger" className="w-9 h-9" />,
    bg: "bg-white",
    hover: "hover:shadow-lg hover:scale-110",
  },
  {
    name: "Facebook",
    url: "https://facebook.com/yourpageid", // Thay bằng link Facebook thực tế
    icon: <img src="/OIP.webp" alt="Facebook" className="w-9 h-9" />,
    bg: "bg-white",
    hover: "hover:shadow-lg hover:scale-110",
  },
  {
    name: "Shopee",
    url: "https://shopee.vn/yourshopid", // Thay bằng link Shopee thực tế
    icon: <img src="/ic_shopee.webp" alt="Shopee" className="w-9 h-9" />,
    bg: "bg-white",
    hover: "hover:shadow-lg hover:scale-110",
  },
];

export default function FloatingSocial() {
  return (
    <div className="fixed right-4 bottom-24 flex flex-col gap-4 z-50">
      {socials.map((item) => (
        <a
          key={item.name}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full flex items-center justify-center w-14 h-14 ${item.bg} ${item.hover} transition duration-200`}
          title={item.name}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}
