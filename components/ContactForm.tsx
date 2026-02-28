"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import emailjs from "@emailjs/browser"
import { toast } from "@/hooks/use-toast"

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const messageRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID"
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID"
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY"

    try {
      const name = nameRef.current?.value ?? ""
      const email = emailRef.current?.value ?? ""
      const message = messageRef.current?.value ?? ""

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: name,
          from_email: email,
          message,
        },
        publicKey
      )

      toast({
        title: "Mensaje enviado",
        description: "¡Mensaje enviado correctamente! Te contactaré pronto.",
        variant: "success",
      })
      if (nameRef.current) nameRef.current.value = ""
      if (emailRef.current) emailRef.current.value = ""
      if (messageRef.current) messageRef.current.value = ""
    } catch (error) {
      console.error("EmailJS error:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar el mensaje. Intenta de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }



  if (!mounted) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Contáctame</h2>
        <p className="text-gray-600">¿Tienes alguna pregunta? Me encantaría escucharte</p>
      </div>
      <form onSubmit={handleSubmit} suppressHydrationWarning className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              ref={nameRef}
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              ref={emailRef}
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje
          </label>
          <textarea
            ref={messageRef}
            id="message"
            name="message"
            autoComplete="off"
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            placeholder="Escribe tu mensaje aquí..."
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Mensaje
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
