import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Technoscope Randevu',
    short_name: 'Randevu',
    description: 'Mersin Technoscope Kurumsal Randevu Takip ve Organizasyon Sistemi',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#1e3a8a',
    lang: 'tr',
    icons: [
      { src: '/manifest-icons/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/manifest-icons/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/manifest-icons/512-maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Bugünün Randevuları',
        url: '/widget',
        icons: [{ src: '/manifest-icons/192', sizes: '192x192', type: 'image/png' }],
      },
    ],
  }
}
