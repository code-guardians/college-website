import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UPIQRCodeProps {
  upiId: string;
  amount: number;
  shopName: string;
  orderId?: string;
}

export default function UPIQRCode({ upiId, amount, shopName, orderId }: UPIQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    // Generate UPI payment URL
    const payeeName = encodeURIComponent(shopName);
    const transactionNote = orderId ? `Order: ${orderId}` : "Campus Marketplace Payment";
    const upiUrl = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&tn=${encodeURIComponent(transactionNote)}`;
    
    // Generate QR code using QR Server API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    setQrCodeUrl(qrUrl);
  }, [upiId, amount, shopName, orderId]);

  return (
    <Card data-testid={`upi-qr-${shopName.replace(/\s+/g, '-').toLowerCase()}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{shopName}</span>
          <span className="text-sm text-muted-foreground">₹{amount.toLocaleString()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* QR Code */}
          <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt={`UPI QR Code for ${shopName}`}
                className="w-full h-full object-contain"
                data-testid={`img-qr-code-${shopName.replace(/\s+/g, '-').toLowerCase()}`}
              />
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                <div className="w-16 h-16 bg-primary/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-primary font-bold">QR</span>
                </div>
                Loading...
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              Scan QR code with any UPI app:
            </p>
            <div className="text-sm space-y-1">
              <p>
                <strong>UPI ID:</strong>{" "}
                <span className="font-mono" data-testid={`text-upi-id-${shopName.replace(/\s+/g, '-').toLowerCase()}`}>
                  {upiId}
                </span>
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                <span data-testid={`text-amount-${shopName.replace(/\s+/g, '-').toLowerCase()}`}>
                  ₹{amount.toLocaleString()}
                </span>
              </p>
              {orderId && (
                <p>
                  <strong>Reference:</strong>{" "}
                  <span className="font-mono text-xs">{orderId}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
