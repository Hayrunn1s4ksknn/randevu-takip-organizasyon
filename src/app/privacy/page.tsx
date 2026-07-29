export const metadata = {
  title: 'Gizlilik Politikası — Technoscope Randevu',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-12 text-[13.5px] leading-relaxed text-text-primary">
      <h1 className="mb-1 text-xl font-extrabold">Gizlilik Politikası ve Kişisel Verilerin Korunması</h1>
      <p className="mb-8 text-[12.5px] text-text-secondary">Son güncelleme: bu metin bir şablondur.</p>

      <p className="mb-6 rounded-[10px] border border-border bg-surface-solid p-4 text-[12.5px] text-text-secondary">
        Bu sayfa, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında bir başlangıç şablonu
        olarak hazırlanmıştır. Yayınlanmadan önce kurumunuzun hukuk/uyumluluk birimi tarafından gözden
        geçirilmesi ve veri sorumlusu bilgileri, iletişim adresi ile fiili veri işleme süreçleriyle
        güncellenmesi gerekir.
      </p>

      <section className="mb-6">
        <h2 className="mb-2 text-[14.5px] font-bold">1. Veri Sorumlusu</h2>
        <p>
          [Kurum unvanı], işbu Randevu Takip ve Organizasyon Sistemi (&quot;Sistem&quot;) üzerinde işlenen
          kişisel veriler bakımından KVKK uyarınca veri sorumlusudur.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[14.5px] font-bold">2. İşlenen Kişisel Veri Kategorileri</h2>
        <ul className="list-disc pl-5">
          <li>Kimlik ve iletişim bilgileri (ad soyad, e-posta, telefon)</li>
          <li>Randevu ve toplantı kayıtları (tarih, saat, konum, ilgili kurum/kişi)</li>
          <li>Görev ve not/yorum içerikleri</li>
          <li>Sisteme yüklenen dosya ekleri</li>
          <li>Kullanıcı hesap ve oturum bilgileri (giriş zamanı, rol)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[14.5px] font-bold">3. İşleme Amaçları ve Hukuki Sebep</h2>
        <p>
          Kişisel veriler; randevu ve organizasyon süreçlerinin yürütülmesi, kurum içi iletişim ve raporlama,
          hizmet kalitesinin artırılması ve hesap güvenliğinin sağlanması amacıyla, KVKK m.5/2 kapsamındaki
          &quot;bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması&quot; ve &quot;veri
          sorumlusunun meşru menfaati&quot; hukuki sebeplerine dayanılarak işlenir.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[14.5px] font-bold">4. Saklama Süresi</h2>
        <p>
          Kişisel veriler, ilgili mevzuatta öngörülen süreler ve/veya işleme amacının gerektirdiği süre
          boyunca saklanır; bu sürenin sonunda silinir, yok edilir veya anonim hale getirilir.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[14.5px] font-bold">5. Veri Sahibinin Hakları (KVKK m.11)</h2>
        <p>İlgili kişiler, veri sorumlusuna başvurarak aşağıdaki haklara sahiptir:</p>
        <ul className="list-disc pl-5">
          <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
          <li>KVKK m.7 şartları çerçevesinde silinmesini/yok edilmesini isteme</li>
          <li>İşlemlerin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
          <li>Otomatik sistemlerle analiz sonucu aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
          <li>Kanuna aykırı işleme nedeniyle zarara uğraması hâlinde zararın giderilmesini talep etme</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-[14.5px] font-bold">6. İletişim</h2>
        <p>Veri sahibi talepleri için: [iletişim e-postası / adresi eklenecek]</p>
      </section>
    </div>
  )
}
