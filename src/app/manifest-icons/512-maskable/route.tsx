import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

// Maskable icons get cropped to a circle/shape by the OS, so the "TR"
// mark is kept well inside the safe zone (~central 60% of the canvas)
// instead of filling the full square like the regular icons.
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
      }}
    >
      <div
        style={{
          display: 'flex',
          color: '#fff',
          fontSize: 150,
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        TR
      </div>
    </div>,
    { width: 512, height: 512 }
  )
}
