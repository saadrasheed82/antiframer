'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, X, Volume2, AlertCircle } from 'lucide-react'

const SYSTEM_PROMPT = `You are Antiframer Voice Assistant — the AI creative voice helper for Antiframer, a Karachi-based AI creative agency.
You are bold, fast, and helpful. Speak concisely in both English and Urdu when appropriate.
Antiframer creates AI videos, AI avatars/UGC-style clips, product & lifestyle images, and full social content packages for Pakistani businesses.
Pricing: AI video starts at PKR 10,000/second, AI avatar/UGC videos at PKR 5,000/second.
Website: antiframer.com | WhatsApp: 0311 8447722 | Email: hello@antiframer.com
Answer questions about our services, pricing, portfolio, and how to get started.`

type Status = 'idle' | 'connecting' | 'listening' | 'speaking'
type ErrorType = string | null

export default function GeminiVoiceAssistant() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<ErrorType>(null)
  const [transcript, setTranscript] = useState('')
  const wsRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scriptRef = useRef<ScriptProcessorNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioQueueRef = useRef<AudioBuffer[]>([])
  const playingRef = useRef(false)
  const pendingConnectRef = useRef(false)

  const getAudioCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext({ sampleRate: 24000 })
    }
    return audioCtxRef.current
  }

  const resumeCtx = async () => {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') await ctx.resume()
  }

  const playAudioChunk = (rawBytes: Uint8Array, mimeType: string) => {
    const decodeAndPlay = async (buf: ArrayBuffer) => {
      try {
        const audioBuf = await getAudioCtx().decodeAudioData(buf)
        audioQueueRef.current.push(audioBuf)
        drainQueue()
      } catch {
        const count = Math.floor(buf.byteLength / 2)
        const audioBuf = getAudioCtx().createBuffer(1, count, 24000)
        const dst = audioBuf.getChannelData(0)
        const view = new Int16Array(buf)
        for (let i = 0; i < count; i++) dst[i] = view[i] / 32768
        audioQueueRef.current.push(audioBuf)
        drainQueue()
      }
    }
    if (mimeType.includes('ogg') || mimeType.includes('webm')) {
      decodeAndPlay(rawBytes.buffer as ArrayBuffer)
    } else if (mimeType.includes('wav')) {
      const view = new DataView(rawBytes.buffer)
      let offset = 0
      if (view.getUint32(0, true) === 0x46464952) offset = 12
      const bytesPerSample = (view.getUint16(offset + 32, true) || 16) / 8
      const rawOffset = Number(view.getUint32(offset + 40, true))
      const sampleCount = Math.floor((rawBytes.length - rawOffset) / bytesPerSample)
      const format = getAudioCtx().createBuffer(1, sampleCount, 24000)
      const dst = format.getChannelData(0)
      if (bytesPerSample === 2) {
        const buf = new Int16Array(rawBytes.buffer, rawOffset)
        for (let i = 0; i < sampleCount; i++) dst[i] = buf[i] / 32768
      }
      audioQueueRef.current.push(format)
      drainQueue()
    } else {
      const count = Math.floor(rawBytes.length / 2)
      const format = getAudioCtx().createBuffer(1, count, 24000)
      const dst = format.getChannelData(0)
      const buf = new Int16Array(rawBytes.buffer)
      for (let i = 0; i < count; i++) dst[i] = buf[i] / 32768
      audioQueueRef.current.push(format)
      drainQueue()
    }
  }

  const drainQueue = () => {
    if (playingRef.current || audioQueueRef.current.length === 0) return
    playingRef.current = true
    const ctx = getAudioCtx()
    const src = ctx.createBufferSource()
    src.buffer = audioQueueRef.current.shift()!
    src.connect(ctx.destination)
    src.onended = () => {
      playingRef.current = false
      drainQueue()
    }
    src.start()
  }

  const connect = async () => {
    if (status === 'connecting' || status === 'speaking') return
    setError(null)
    pendingConnectRef.current = true

    try {
      setStatus('connecting')

      const res = await fetch('/api/gemini-token')
      const data = await res.json()
      if (!data.accessToken) {
        throw new Error(data.error || 'API key not configured — add GEMINI_API_KEY to .env.local')
      }

      const ws = new WebSocket(
        `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${data.accessToken}`
      )
      wsRef.current = ws

      ws.onopen = async () => {
        if (!pendingConnectRef.current) { ws.close(); return }
        ws.send(JSON.stringify({
          setup: {
            model: 'models/gemini-2.0-flash-exp',
            responseModalities: ['AUDIO'],
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          },
        }))
        try {
          await resumeCtx()
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
          })
          streamRef.current = stream

          const ctx = getAudioCtx()
          const source = ctx.createMediaStreamSource(stream)
          const script = ctx.createScriptProcessor(4096, 1, 1)
          scriptRef.current = script

          script.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return
            const input = e.inputBuffer.getChannelData(0)
            const int16 = new Int16Array(input.length)
            for (let i = 0; i < input.length; i++) {
              int16[i] = Math.max(-32768, Math.min(32767, input[i] * 32768))
            }
            ws.send(int16.buffer)
          }

          source.connect(script)
          script.connect(ctx.destination)
          setStatus('listening')
        } catch (micErr) {
          console.error('Mic error:', micErr)
          setError('Could not access microphone. Allow mic permissions in your browser.')
          ws.close()
          setStatus('idle')
        }
      }

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data)
          if (msg.setup != null) {
            console.log('Setup acknowledged by server')
            return
          }
          if (msg.serverContent) {
            const sc = msg.serverContent
            if (sc.modelTurn?.parts) {
              for (const part of sc.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const bytes = new Uint8Array(
                    atob(part.inlineData.data).split('').map(c => c.charCodeAt(0))
                  )
                  playAudioChunk(bytes, part.inlineData.mimeType || 'audio/pcm')
                  setStatus('speaking')
                }
              }
            }
            if (sc.outputTranscription?.text) {
              setTranscript(sc.outputTranscription.text)
            }
          }
          if (msg.toolCall?.functionResponses) {
            ws.send(JSON.stringify({ toolResponse: msg.toolCall }))
          }
        } catch (parseErr) {
          console.warn('Message parse warning:', parseErr)
        }
      }

      ws.onerror = (evt) => {
        console.error('WebSocket error:', evt)
        setError('Connection error. Please try again.')
      }

      ws.onclose = (evt) => {
        stopMic()
        if (evt.code !== 1000 && pendingConnectRef.current) {
          setError(`Connection closed (code ${evt.code}). Check your API key.`)
          setStatus('idle')
        }
        wsRef.current = null
      }
    } catch (err) {
      console.error('Connect error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('idle')
      pendingConnectRef.current = false
    }
  }

  const stopMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (scriptRef.current) {
      scriptRef.current.disconnect()
      scriptRef.current = null
    }
  }

  const disconnect = () => {
    pendingConnectRef.current = false
    wsRef.current?.close()
    wsRef.current = null
    stopMic()
    setStatus('idle')
    setError(null)
    setTranscript('')
    setOpen(false)
  }

  useEffect(() => {
    return () => {
      pendingConnectRef.current = false
      wsRef.current?.close()
      stopMic()
    }
  }, [])

  return (
    <>
      <button
        onClick={() => open ? disconnect() : setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105"
        style={{ background: 'var(--red, #ea0e4b)', color: '#fff' }}
        aria-label="Open voice assistant"
      >
        <Volume2 size={24} />
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: '#04040b', color: '#fff', border: '1px solid var(--border, #d3d3d3)' }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border, #d3d3d3)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Antiframer Voice
            </span>
            <button onClick={disconnect} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 flex flex-col items-center gap-3">
            {error && (
              <div className="w-full flex items-start gap-2 px-3 py-2 rounded text-xs" style={{ background: 'rgba(234,14,75,0.15)', color: '#ff6b8a' }}>
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {status === 'listening' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--red, #ea0e4b)' }} />
                <span style={{ fontSize: '11px', color: '#888' }}>Listening...</span>
              </div>
            )}
            {status === 'speaking' && (
              <div className="flex gap-1 items-end h-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1 rounded-full" style={{ height: `${10 + i * 5}px`, background: 'var(--lime, #e1ef7c)', animation: 'bounce 0.5s infinite alternate' }} />
                ))}
              </div>
            )}

            <p className="text-xs text-center" style={{ color: '#888', minHeight: '16px' }}>
              {status === 'idle' && !error && 'Tap Start to talk'}
              {status === 'connecting' && 'Connecting...'}
            </p>

            {transcript && (
              <p className="text-xs w-full text-center px-3 py-2 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#ccc' }}>
                {transcript}
              </p>
            )}

            <button
              onClick={connect}
              disabled={status === 'connecting'}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium"
              style={{ background: status === 'listening' ? '#333' : 'var(--red, #ea0e4b)', color: '#fff', opacity: status === 'connecting' ? 0.5 : 1 }}
            >
              {status === 'listening' ? <MicOff size={14} /> : <Mic size={14} />}
              {status === 'listening' ? 'Stop' : 'Start'}
            </button>
          </div>

          <div className="px-4 py-2 text-xs text-center" style={{ color: '#555', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            AI-powered voice assistant &middot; Powered by Gemini
          </div>
        </div>
      )}
    </>
  )
}
