'use client'

export function NewspaperMasthead() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="text-center border-b-4 border-double border-[#1a1a1a] pb-2 mb-3 shrink-0">
      <h1 className="font-serif text-2xl sm:text-4xl font-black tracking-tight text-[#1a1a1a] leading-none">
        PROCESS NEWSPAPER
      </h1>
      <p className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#6b5f4a]">{today}</p>
    </div>
  )
}
