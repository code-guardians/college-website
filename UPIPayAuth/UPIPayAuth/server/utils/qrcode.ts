// UPI QR Code generation utilities
export function generateUPIUrl(upiId: string, amount: number, name: string, note?: string): string {
  const params = new URLSearchParams({
    pa: upiId, // UPI ID
    pn: name,  // Payee name
    am: amount.toString(), // Amount
    cu: 'INR', // Currency
  });

  if (note) {
    params.append('tn', note); // Transaction note
  }

  return `upi://pay?${params.toString()}`;
}

export function generateQRCodeUrl(upiUrl: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiUrl)}`;
}

export function createUPIPayment(upiId: string, amount: number, shopName: string, orderId?: string) {
  const note = orderId ? `Order: ${orderId}` : 'Campus Marketplace Payment';
  const upiUrl = generateUPIUrl(upiId, amount, shopName, note);
  const qrCodeUrl = generateQRCodeUrl(upiUrl);

  return {
    upiId,
    amount,
    shopName,
    upiUrl,
    qrCodeUrl,
    orderId,
  };
}
