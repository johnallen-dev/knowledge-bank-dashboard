'use client'

export function NewspaperMasthead() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="text-center border-b-4 border-double border-[#1a1a1a] pb-4 mb-6">
      <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight text-[#1a1a1a]">
        PROCESS NEWSPAPER
      </h1>
      <p className="mt-2 text-xs sm:text-sm uppercase tracking-[0.25em] text-[#6b5f4a]">{today}</p>
    </div>
  )
}
