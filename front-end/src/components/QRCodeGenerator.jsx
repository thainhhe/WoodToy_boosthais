import { useMemo, useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QRCodeGenerator({ url, size = 180 }) {
  // Nếu không truyền url, mặc định là trang Home
  const qrUrl = useMemo(() => url || window.location.origin + "/", [url]);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(qrUrl, { width: size, margin: 2 }, (err, url) => {
      if (!err) setQrDataUrl(url);
    });
  }, [qrUrl, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      {qrDataUrl && (
        <img src={qrDataUrl} alt="QR code" width={size} height={size} />
      )}
      <div className="text-xs break-all text-gray-500">{qrUrl}</div>
    </div>
  );
}
