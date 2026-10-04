export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 pb-16">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mb-6 text-xs text-muted-foreground">Last updated: {updated}</p>
      <div className="flex flex-col gap-3 text-sm leading-relaxed [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:underline">
        {children}
      </div>
    </main>
  );
}
