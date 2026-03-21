import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Download,
  Printer,
  Loader2,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  FileJson,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBusQR } from "../hooks/useBusQR";
import { downloadRaster, downloadPDF, triggerDownload, getBrandedSVG } from "../utils/qr-export";
import { toast } from "@/hooks/use-toast";

interface BusQRCodeProps {
  busId: string;
  busNumber: string;
}

export function BusQRCode({ busId, busNumber }: BusQRCodeProps) {
  const { qrToken, isLoading, refetch } = useBusQR(busId);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Pop-up Blocked", description: "Please allow pop-ups to print the QR code." });
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - Bus ${busNumber}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .container { padding: 40px; border: 2px solid #eee; border-radius: 20px; }
            h1 { font-size: 48px; margin-bottom: 10px; }
            p { font-size: 24px; color: #666; margin-bottom: 40px; }
            svg { width: 400px; height: 400px; }
            .footer { margin-top: 40px; font-size: 14px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Bus ${busNumber}</h1>
            <p>Scan to Board</p>
            ${printContent.innerHTML}
            <div class="footer">SwapRide Intrastate - Passenger Self-Boarding</div>
          </div>
          <script>
            window.onload = () => { window.print(); window.onafterprint = () => window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Generating secure QR code...</p>
      </div>
    );
  }

  if (!qrToken) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-[400px] text-center">
        <div className="mb-4 p-4 rounded-full bg-destructive/10">
          <RefreshCw className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">QR Code Generation Failed</h3>
        <p className="text-muted-foreground max-w-xs mb-6">We couldn't generate a secure token for this bus.</p>
        <Button onClick={refetch}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard-card p-6">
      <div className="flex flex-col items-center space-y-8 py-4">
        <div className="bg-white rounded-2xl border border-border/50 relative group transition-all duration-300">
          <div ref={printRef} id="qr-code-display" className="p-2 bg-white">
            <QRCodeSVG
              id="bus-qr-svg"
              value={qrToken}
              size={280}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <div className="text-center w-full max-w-md">
          <h3 className="text-xl font-bold mb-1">Bus {busNumber}</h3>
          <p className="text-sm text-muted-foreground mb-6">Passenger self-boarding QR code</p>

          <div className="flex flex-wrap justify-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 px-6 gap-2 border-primary/20 hover:border-primary/50">
                  <Download className="h-4 w-4" /> Download QR <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => {
                    const svg = getBrandedSVG("bus-qr-svg", busNumber);
                    if (svg)
                      triggerDownload(
                        URL.createObjectURL(
                          new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }),
                        ),
                        `Bus-${busNumber}-QR.svg`,
                      );
                  }}
                >
                  <FileJson className="h-4 w-4 text-blue-500" /> SVG (Vector)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => downloadRaster("bus-qr-svg", busNumber, "png")}
                >
                  <ImageIcon className="h-4 w-4 text-green-500" /> PNG (High Res)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => downloadRaster("bus-qr-svg", busNumber, "jpg")}
                >
                  <ImageIcon className="h-4 w-4 text-orange-500" /> JPG (Standard)
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => downloadPDF("bus-qr-svg", busNumber)}>
                  <FileText className="h-4 w-4 text-red-500" /> PDF Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="h-11 px-6 gap-2 shadow-lg shadow-primary/20" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print Sticker
            </Button>
          </div>
        </div>

        <div className="max-w-md bg-muted/30 p-5 rounded-xl border border-border/50">
          <div className="flex gap-3">
            <RefreshCw className="h-4 w-4 text-primary mt-1 shrink-0" />
            <p className="text-[12px] leading-relaxed text-muted-foreground text-left">
              <strong className="text-foreground">Export Formats:</strong> Use SVG for professional signboards, PNG for
              web, and PDF for office printers. All exports include the bus identifier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
