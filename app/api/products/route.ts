import { NextRequest, NextResponse } from "next/server"

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbziGrJNpbVKnh6xSmDxgTutW_h3Yz43TsRilfKqH3ZbVTBRpqEFl_ettzX1x9u8FHUV/exec"

async function parseScriptResponse(res: Response) {
  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()

  if (contentType.includes("application/json")) {
    return JSON.parse(text)
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error("El servidor externo devolvió una respuesta inválida")
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const upstreamUrl = new URL(SCRIPT_URL)
    url.searchParams.forEach((value, key) => {
      upstreamUrl.searchParams.set(key, value)
    })

    if (!upstreamUrl.searchParams.has("action")) {
      upstreamUrl.searchParams.set("action", "listar_productos")
    }

    const res = await fetch(upstreamUrl.toString(), {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    })

    const data = await parseScriptResponse(res)
    return NextResponse.json(data, { status: res.ok ? 200 : res.status })
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Error de conexión con el servidor" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow",
      cache: "no-store",
    })

    const data = await parseScriptResponse(res)
    return NextResponse.json(data, { status: res.ok ? 200 : res.status })
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Error de conexión con el servidor" },
      { status: 500 }
    )
  }
}
