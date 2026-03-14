"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import type { RegisteredComponentProps } from "@/components/admin/page-builder/ComponentRegistry"

export interface ContactInfo {
  email: string
  phone: string
  address: string
}

export interface ContactSectionContent {
  title: string
  subtitle: string
  contactInfo: ContactInfo
  formTitle: string
  submitButtonText: string
  showMap: boolean
  mapEmbedUrl?: string
}

const defaultContent: ContactSectionContent = {
  title: "Contáctanos",
  subtitle: "Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.",
  contactInfo: {
    email: "contacto@ejemplo.com",
    phone: "+1 234 567 890",
    address: "Calle Principal 123, Ciudad, País",
  },
  formTitle: "Envíanos un mensaje",
  submitButtonText: "Enviar mensaje",
  showMap: false,
}

export function ContactSection({
  content,
  styles,
  isEditable = false,
  isSelected = false,
  onSelect,
  onContentChange,
}: RegisteredComponentProps) {
  const {
    title = defaultContent.title,
    subtitle = defaultContent.subtitle,
    contactInfo = defaultContent.contactInfo,
    formTitle = defaultContent.formTitle,
    submitButtonText = defaultContent.submitButtonText,
    showMap = defaultContent.showMap,
    mapEmbedUrl,
  } = content as ContactSectionContent

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleTextChange = (field: string, value: string) => {
    if (onContentChange) {
      onContentChange({ ...content, [field]: value })
    }
  }

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    if (onContentChange) {
      onContentChange({
        ...content,
        contactInfo: { ...contactInfo, [field]: value },
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditable) return
    // Handle form submission here
    console.log("Form submitted:", formData)
  }

  return (
    <section
      className={cn(
        "py-12 md:py-16 lg:py-20",
        isSelected && "ring-2 ring-primary",
        styles?.className
      )}
      style={{
        backgroundColor: styles?.backgroundColor,
        color: styles?.textColor,
      }}
      onClick={onSelect}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          {isEditable ? (
            <>
              <h2
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 outline-none focus:ring-2 focus:ring-primary rounded px-2"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange("title", e.currentTarget.textContent || "")}
              >
                {title}
              </h2>
              <p
                className="text-muted-foreground text-lg max-w-2xl mx-auto outline-none focus:ring-2 focus:ring-primary rounded px-2"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange("subtitle", e.currentTarget.textContent || "")}
              >
                {subtitle}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                {title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {subtitle}
              </p>
            </>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      {isEditable ? (
                        <p
                          className="text-muted-foreground outline-none focus:ring-2 focus:ring-primary rounded px-1"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleContactInfoChange("email", e.currentTarget.textContent || "")
                          }
                        >
                          {contactInfo.email}
                        </p>
                      ) : (
                        <a
                          href={`mailto:${contactInfo.email}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {contactInfo.email}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Teléfono</h3>
                      {isEditable ? (
                        <p
                          className="text-muted-foreground outline-none focus:ring-2 focus:ring-primary rounded px-1"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleContactInfoChange("phone", e.currentTarget.textContent || "")
                          }
                        >
                          {contactInfo.phone}
                        </p>
                      ) : (
                        <a
                          href={`tel:${contactInfo.phone}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {contactInfo.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Dirección</h3>
                      {isEditable ? (
                        <p
                          className="text-muted-foreground outline-none focus:ring-2 focus:ring-primary rounded px-1"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleContactInfoChange("address", e.currentTarget.textContent || "")
                          }
                        >
                          {contactInfo.address}
                        </p>
                      ) : (
                        <p className="text-muted-foreground">{contactInfo.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            {showMap && mapEmbedUrl && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación"
                />
              </div>
            )}
          </div>

          {/* Contact Form */}
          <Card>
            <CardContent className="p-6">
              {isEditable ? (
                <h3
                  className="text-xl font-semibold mb-6 outline-none focus:ring-2 focus:ring-primary rounded px-1"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextChange("formTitle", e.currentTarget.textContent || "")}
                >
                  {formTitle}
                </h3>
              ) : (
                <h3 className="text-xl font-semibold mb-6">{formTitle}</h3>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      disabled={isEditable}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={isEditable}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    placeholder="¿En qué podemos ayudarte?"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    disabled={isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Escribe tu mensaje aquí..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    disabled={isEditable}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isEditable}>
                  <Send className="w-4 h-4 mr-2" />
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleTextChange("submitButtonText", e.currentTarget.textContent || "")
                      }
                      className="outline-none"
                    >
                      {submitButtonText}
                    </span>
                  ) : (
                    submitButtonText
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
