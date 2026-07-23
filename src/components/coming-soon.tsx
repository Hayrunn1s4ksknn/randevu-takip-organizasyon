export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface-solid p-10 text-center">
      <div className="text-[14.5px] font-bold text-text-primary">{title}</div>
      <p className="max-w-sm text-[13px] text-text-secondary">
        Bu modül Faz 2 kapsamında Supabase verisiyle bağlanacak. Şimdilik Dashboard ve Randevular modülleri
        gerçek veriyle çalışıyor.
      </p>
    </div>
  )
}
