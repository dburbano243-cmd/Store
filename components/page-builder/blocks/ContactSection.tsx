"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, AlertCircle } from "lucide-react"
import emailjs from "@emailjs/browser"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { RegisteredComponentProps } from "@/components/admin/page-builder/ComponentRegistry"

export interface ContactSectionContent {
  title: string
  subtitle: string
  submitButtonText: string
  // Labels del formulario
  nameLabel: string
  namePlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  messageLabel: string
  messagePlaceholder: string
  // Mensajes
  successTitle: string
  successMessage: string
  errorTitle: string
  errorMessage: string
}

const defaultContent: ContactSectionContent = {
  title: "Contáctame",
  subtitle: "¿Tienes alguna pregunta? Me encantaría escucharte",
  submitButtonText: "Enviar Mensaje",
  // Labels
  nameLabel: "Nombre",
  namePlaceholder: "Tu nombre completo",
  emailLabel: "Correo Electrónico",
  emailPlaceholder: "tu@email.com",
  messageLabel: "Mensaje",
  messagePlaceholder: "Escribe tu mensaje aquí...",
  // Mensajes
  successTitle: "Mensaje enviado",
  successMessage: "¡Mensaje enviado correctamente! Te contactaré pronto.",
  errorTitle: "Error",
  errorMessage: "Ocurrió un error al enviar el mensaje. Intenta de nuevo más tarde.",
}

export function ContactSection({
  content,
  styles,
  isEditable = false,
  isSelected = false,
  onSelect,
  onContentChange,
}: RegisteredComponentProps) {
  const mergedContent = { ...defaultContent, ...content } as ContactSectionContent
  const {
    title,
    subtitle,
    submitButtonText,
    nameLabel,
    namePlaceholder,
    emailLabel,
    emailPlaceholder,
    messageLabel,
    messagePlaceholder,
    successTitle,
    successMessage,
    errorTitle,
    errorMessage,
  } = mergedContent

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const messageRef = useRef<HTMLTextAreaElement | null>(null)

  // Check if EmailJS is configured
  const isEmailJSConfigured = Boolean(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID &&
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isEditable) return
    
    setIsSubmitting(true)

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || ""
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || ""
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ""

    if (!serviceId || !templateId || !publicKey) {
      toast({
        title: errorTitle,
        description: "El formulario de contacto no está configurado correctamente.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

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
        title: successTitle,
        description: successMessage,
        variant: "success",
      })
      
      // Clear form
      if (nameRef.current) nameRef.current.value = ""
      if (emailRef.current) emailRef.current.value = ""
      if (messageRef.current) messageRef.current.value = ""
    } catch (error) {
      console.error("EmailJS error:", error)
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  return (
    <section
      className={cn(
        "py-12 md:py-16",
        isSelected && "ring-2 ring-primary ring-offset-2",
        styles?.className
      )}
      style={{
        backgroundColor: styles?.backgroundColor,
        color: styles?.textColor,
      }}
      onClick={onSelect}
    >
      <div className="max-w-2xl mx-auto px-4">
        {/* Warning for editor when EmailJS is not configured */}
        {isEditable && !isEmailJSConfigured && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-yellow-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">
              <strong>EmailJS no configurado:</strong> Ve a Estilos Globales {"->"} Integraciones para configurar.
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl font-bold mb-4"
            style={{ color: styles?.textColor || "#111827" }}
          >
            {title}
          </h2>
          <p style={{ color: styles?.textColor ? `${styles.textColor}99` : "#4b5563" }}>
            {subtitle}
          </p>
        </div>

        {/* Form - Exactly like original ContactForm.tsx */}
        <form onSubmit={handleSubmit} suppressHydrationWarning className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                htmlFor="contact-name" 
                className="block text-sm font-medium mb-2"
                style={{ color: styles?.textColor ? `${styles.textColor}cc` : "#374151" }}
              >
                {nameLabel}
              </label>
              <input
                ref={nameRef}
                type="text"
                id="contact-name"
                name="name"
                autoComplete="name"
                required
                disabled={isEditable}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={namePlaceholder}
              />
            </div>

            <div>
              <label 
                htmlFor="contact-email" 
                className="block text-sm font-medium mb-2"
                style={{ color: styles?.textColor ? `${styles.textColor}cc` : "#374151" }}
              >
                {emailLabel}
              </label>
              <input
                ref={emailRef}
                type="email"
                id="contact-email"
                name="email"
                autoComplete="email"
                required
                disabled={isEditable}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={emailPlaceholder}
              />
            </div>
          </div>

          <div>
            <label 
              htmlFor="contact-message" 
              className="block text-sm font-medium mb-2"
              style={{ color: styles?.textColor ? `${styles.textColor}cc` : "#374151" }}
            >
              {messageLabel}
            </label>
            <textarea
              ref={messageRef}
              id="contact-message"
              name="message"
              autoComplete="off"
              required
              disabled={isEditable}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={messagePlaceholder}
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting || isEditable}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: styles?.buttonColor || "#111827", 
                color: styles?.buttonTextColor || "#ffffff" 
              } as React.CSSProperties}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {submitButtonText}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
