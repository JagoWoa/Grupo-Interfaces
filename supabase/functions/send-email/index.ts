// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// @ts-ignore
const GMAIL_USER = Deno.env.get("GMAIL_USER")
// @ts-ignore
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    const { to, subject, html } = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      throw new Error("Gmail credentials not configured")
    }

    console.log("Sending email to:", to)
    console.log("Using Gmail user:", GMAIL_USER)

    // Conectar y enviar usando Deno's native TLS
    // @ts-ignore
    const conn = await Deno.connectTls({
      hostname: "smtp.gmail.com",
      port: 465, // SSL port
    })

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Leer respuesta del servidor
    const readResponse = async () => {
      const buffer = new Uint8Array(1024)
      const n = await conn.read(buffer)
      if (n) {
        const response = decoder.decode(buffer.subarray(0, n))
        console.log("Server:", response.trim())
        return response
      }
      return ""
    }

    // Enviar comando
    const sendCommand = async (command: string) => {
      console.log("Client:", command.trim())
      await conn.write(encoder.encode(command))
      return await readResponse()
    }

    // Protocolo SMTP
    await readResponse() // Banner inicial
    await sendCommand(`EHLO localhost\r\n`)
    await sendCommand(`AUTH LOGIN\r\n`)
    await sendCommand(btoa(GMAIL_USER) + `\r\n`)
    await sendCommand(btoa(GMAIL_APP_PASSWORD) + `\r\n`)
    await sendCommand(`MAIL FROM:<${GMAIL_USER}>\r\n`)
    await sendCommand(`RCPT TO:<${to}>\r\n`)
    await sendCommand(`DATA\r\n`)
    
    const emailContent = `From: ${GMAIL_USER}\r\nTo: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n.\r\n`
    await sendCommand(emailContent)
    await sendCommand(`QUIT\r\n`)
    
    conn.close()

    console.log("Email sent successfully to:", to)

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email"
    console.error("Error sending email:", errorMessage, error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
