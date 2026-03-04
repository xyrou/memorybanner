import QRCode from 'qrcode'

export async function generateQRSvg(slug: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`
  const svg = await QRCode.toString(url, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  })
  return svg
}

export async function generateQRPng(slug: string): Promise<Buffer> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`
  const buffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: 1200, // print-ready
    margin: 2,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  })
  return buffer
}
