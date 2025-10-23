// front-end/src/components/LoadingOverlay.jsx
import { useEffect } from "react";

export default function LoadingOverlay({ isLoading, message = "Đang xử lý..." }) {
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

      {/* Loading Card */}
      <div className="relative bg-white rounded-lg shadow-2xl p-8 flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        </div>

        {/* Message */}
        <p className="text-gray-700 font-medium text-lg">{message}</p>
        <p className="text-gray-500 text-sm">Vui lòng đợi...</p>
      </div>
    </div>
  );
}

