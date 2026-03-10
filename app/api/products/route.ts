import { NextRequest, NextResponse } from "next/server"

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbziGrJNpbVKnh6xSmDxgTutW_h3Yz43TsRilfKqH3ZbVTBRpqEFl_ettzX1x9u8FHUV/exec"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Error de conexión con el servidor" },
      { status: 500 }
    )
  }
}
