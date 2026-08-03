import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1e3a8a',
        color: '#fff',
        fontSize: 92,
        fontWeight: 700,
        fontFamily: 'sans-serif',
      }}
    >
      TR
    </div>,
    { width: 192, height: 192 }
  )
}
