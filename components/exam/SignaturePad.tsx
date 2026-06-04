'use client'
import { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export interface SignaturePadHandle {
  toDataURL: () => string
  isEmpty: () => boolean
  clear: () => void
}

export const SignaturePad = forwardRef<SignaturePadHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [empty, setEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    drawPlaceholder(canvas, ctx)
  }, [])

  function drawPlaceholder(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Sign here', canvas.width / 2, canvas.height / 2 + 5)
    ctx.restore()
  }

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    if (empty) {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
      setEmpty(false)
    }
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function endDraw() { drawing.current = false }

  useImperativeHandle(ref, () => ({
    toDataURL: () => canvasRef.current?.toDataURL('image/png') ?? '',
    isEmpty: () => empty,
    clear: () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      drawPlaceholder(canvas, ctx)
      setEmpty(true)
    },
  }))

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={500}
        height={180}
        className="w-full border-2 rounded-lg bg-white touch-none cursor-crosshair"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      {!empty && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const canvas = canvasRef.current
            const ctx = canvas?.getContext('2d')
            if (!canvas || !ctx) return
            drawPlaceholder(canvas, ctx)
            setEmpty(true)
          }}
        >
          <Trash2 className="h-3 w-3" />
          Clear signature
        </Button>
      )}
    </div>
  )
})

SignaturePad.displayName = 'SignaturePad'
