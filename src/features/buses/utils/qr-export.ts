import jsPDF from "jspdf";

export const getBrandedSVG = (svgId: string, busNumber: string) => {
  const svgElement = document.getElementById(svgId);
  if (!svgElement) return null;

  const targetSize = 1024;
  const padding = 60;
  const titleHeight = 160;

  const newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newSvg.setAttribute("width", targetSize.toString());
  newSvg.setAttribute("height", targetSize.toString());
  newSvg.setAttribute("viewBox", `0 0 ${targetSize} ${targetSize}`);
  newSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  // Background
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute("fill", "#FFFFFF");
  newSvg.appendChild(bg);

  // Title - Centered at the top
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", (targetSize / 2).toString());
  text.setAttribute("y", (titleHeight / 2 + 40).toString());
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-family", "Arial, sans-serif");
  text.setAttribute("font-size", "92px");
  text.setAttribute("font-weight", "900");
  text.setAttribute("fill", "#000000");
  text.textContent = `BUS: ${busNumber}`;
  newSvg.appendChild(text);

  // Detect interior QR size from viewBox (most reliable for qrcode.react)
  const viewBox = svgElement.getAttribute("viewBox");
  let internalSize = 280;
  if (viewBox) {
    const parts = viewBox.split(" ");
    if (parts.length === 4) {
      internalSize = parseFloat(parts[2]);
    }
  } else {
    internalSize = parseFloat(svgElement.getAttribute("width") || "280");
  }

  // QR Code - Maximize size in remaining space
  const qrAreaSize = targetSize - padding * 2 - titleHeight + 20;
  const scale = qrAreaSize / internalSize;

  const qrGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const xOffset = (targetSize - qrAreaSize) / 2;
  const yOffset = titleHeight;
  qrGroup.setAttribute("transform", `translate(${xOffset}, ${yOffset}) scale(${scale})`);

  Array.from(svgElement.childNodes).forEach((child) => {
    qrGroup.appendChild(child.cloneNode(true));
  });
  newSvg.appendChild(qrGroup);

  return newSvg;
};

export const triggerDownload = (url: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadSVG = (svgId: string, busNumber: string) => {
  const svg = getBrandedSVG(svgId, busNumber);
  if (!svg) return;
  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  triggerDownload(svgUrl, `Bus-${busNumber}-QR.svg`);
};

export const downloadRaster = async (svgId: string, busNumber: string, format: "png" | "jpg") => {
  const svg = getBrandedSVG(svgId, busNumber);
  if (!svg) return;

  const targetSize = 1024;
  const renderScale = 2;
  const canvasSize = targetSize * renderScale;

  const canvas = document.createElement("canvas");
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const ctx = canvas.getContext("2d");
  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new Image();

  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  return new Promise<void>((resolve) => {
    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL(`image/${format === "jpg" ? "jpeg" : "png"}`, 1.0);
      triggerDownload(dataUrl, `Bus-${busNumber}-QR.${format}`);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.src = url;
  });
};

export const downloadPDF = async (svgId: string, busNumber: string) => {
  const svg = getBrandedSVG(svgId, busNumber);
  if (!svg) return;

  const targetSize = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = targetSize * 2;
  canvas.height = targetSize * 2;

  const ctx = canvas.getContext("2d");
  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new Image();

  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  return new Promise<void>((resolve) => {
    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Center a 160mm square sticker on the A4 page
      const stickerSizeMM = 160;
      const x = (pdfWidth - stickerSizeMM) / 2;
      const y = (pdfHeight - stickerSizeMM) / 2;

      pdf.addImage(dataUrl, "JPEG", x, y, stickerSizeMM, stickerSizeMM);
      pdf.save(`Bus-${busNumber}-QR.pdf`);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.src = url;
  });
};
