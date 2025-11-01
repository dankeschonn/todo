let notes: string[] = []

export async function GET() {
    return Response.json({ notes });
}

export async function POST(request: Request) {
    const { text } = await request.json()
    let req = request.body
    if(!text) return new Response("Missing text", { status: 400 })
    notes.push(text)
    return Response.json({ success: true, notes })
}

export async function PUT(request: Request) {
    const { newNotes } = await request.json()
    notes = newNotes.slice()
    return Response.json({ success: true, notes})
}