import { NextRequest, NextResponse } from 'next/server'
import { listCategories, createCategory } from '@/lib/db/queries/categories'

export async function GET() {
  try {
    return NextResponse.json(await listCategories())
  } catch (err) {
    console.error('[GET /api/categories]', err)
    return NextResponse.json({ error: 'Failed to list categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    const id = await createCategory(body)
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/categories]', err)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
