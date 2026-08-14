import 'server-only'
import { normalizeTurkishPhone } from '@/lib/phone'

const SEND_URL = 'https://api.netgsm.com.tr/sms/send/xml'
const BALANCE_URL = 'https://api.netgsm.com.tr/get_kredi.asp'

// NetGSM error codes for send/xml — first two characters of the response body.
const ERROR_MESSAGES: Record<string, string> = {
  '20': 'Mesaj metni veya karakter sınırı hatalı.',
  '30': 'Geçersiz kullanıcı adı, şifre veya API erişim izni yok.',
  '40': 'Gönderici başlığı (msgheader) sistemde tanımlı değil.',
  '50': 'IYS filtre hatası.',
  '51': 'Abone hesabına ait ek paket hatası.',
  '70': 'Hatalı sorgulama, parametre eksik/hatalı.',
  '80': 'Gönderim limiti aşıldı.',
  '85': 'Mükerrer gönderim (aynı mesaj kısa sürede tekrar gönderildi).',
}

function xmlEscape(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function sendSms({ to, message }: { to: string; message: string }) {
  const username = process.env.NETGSM_USERNAME
  const password = process.env.NETGSM_PASSWORD
  const header = process.env.NETGSM_HEADER
  if (!username || !password || !header) throw new Error('NetGSM API bilgileri tanımlı değil.')

  const phone = normalizeTurkishPhone(to)
  if (!phone) throw new Error('Geçersiz telefon numarası.')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <company>Netgsm</company>
    <usercode>${xmlEscape(username)}</usercode>
    <password>${xmlEscape(password)}</password>
    <type>1:n</type>
    <msgheader>${xmlEscape(header)}</msgheader>
  </header>
  <body>
    <msg><![CDATA[${message}]]></msg>
    <no>${phone}</no>
  </body>
</mainbody>`

  const res = await fetch(SEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
    body: xml,
  })
  const text = (await res.text()).trim()
  const code = text.slice(0, 2)
  if (code !== '00' && code !== '01') {
    throw new Error(ERROR_MESSAGES[code] ?? `SMS gönderilemedi (kod: ${code || 'bilinmiyor'}).`)
  }
  return { jobId: text.slice(2).trim() }
}

// Free — does not send anything or cost money. Used to validate that
// NETGSM_USERNAME/NETGSM_PASSWORD are correct before relying on them.
export async function getSmsBalance() {
  const username = process.env.NETGSM_USERNAME
  const password = process.env.NETGSM_PASSWORD
  if (!username || !password) throw new Error('NetGSM API bilgileri tanımlı değil.')

  const url = `${BALANCE_URL}?usercode=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  const res = await fetch(url)
  const text = (await res.text()).trim()
  if (text.startsWith('30')) throw new Error('Geçersiz kullanıcı adı veya şifre.')
  return text
}
