"use client"

import { useState } from "react"
import { 
  Mail, 
  CreditCard, 
  Database, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  AlertTriangle,
  Copy,
  Check,
  Info
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// Check environment variables
const INTEGRATIONS_STATUS = {
  emailjs: {
    serviceId: !!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    templateId: !!process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    publicKey: !!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  },
  wompi: {
    publicKey: !!process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
    privateKey: !!process.env.WOMPI_PRIVATE_KEY,
    eventsSecret: !!process.env.WOMPI_EVENTS_SECRET,
  },
  supabase: {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast({ title: "Copiado al portapapeles" })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  )
}

function StatusBadge({ configured }: { configured: boolean }) {
  if (configured) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Configurado
      </Badge>
    )
  }
  return (
    <Badge variant="destructive">
      <XCircle className="mr-1 h-3 w-3" />
      No configurado
    </Badge>
  )
}

function EnvVarStatus({ name, configured, description }: { 
  name: string
  configured: boolean
  description: string 
}) {
  return (
    <div className="rounded-lg border bg-muted/50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono">{name}</code>
          <CopyButton text={name} />
        </div>
        {configured ? (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Configurado
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-red-600">
            <XCircle className="h-3 w-3" />
            Falta
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

export default function IntegrationsPage() {
  const emailjsConfigured = INTEGRATIONS_STATUS.emailjs.serviceId && 
                            INTEGRATIONS_STATUS.emailjs.templateId && 
                            INTEGRATIONS_STATUS.emailjs.publicKey

  const wompiConfigured = INTEGRATIONS_STATUS.wompi.publicKey && 
                          INTEGRATIONS_STATUS.wompi.privateKey

  const supabaseConfigured = INTEGRATIONS_STATUS.supabase.url && 
                             INTEGRATIONS_STATUS.supabase.anonKey

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integraciones</h1>
        <p className="text-muted-foreground">
          Configura las integraciones de terceros para tu tienda
        </p>
      </div>

      {/* Security Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Seguridad de credenciales</AlertTitle>
        <AlertDescription>
          Las credenciales se configuran como variables de entorno en Vercel para mayor seguridad.
          Nunca se almacenan en la base de datos ni se exponen en el código.
          Configura las variables en <strong>Settings &gt; Vars</strong> de tu proyecto en v0 o en el panel de Vercel.
        </AlertDescription>
      </Alert>

      {/* Integration Cards */}
      <Tabs defaultValue="emailjs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emailjs" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            EmailJS
            {emailjsConfigured ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="wompi" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Wompi
            {wompiConfigured ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="supabase" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Supabase
            {supabaseConfigured ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* EmailJS Tab */}
        <TabsContent value="emailjs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                    <Mail className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>EmailJS</CardTitle>
                    <CardDescription>Servicio de envío de emails desde el formulario de contacto</CardDescription>
                  </div>
                </div>
                <StatusBadge configured={emailjsConfigured} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              {!emailjsConfigured && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Configuración incompleta</AlertTitle>
                  <AlertDescription>
                    El formulario de contacto no enviará emails hasta que configures todas las variables.
                  </AlertDescription>
                </Alert>
              )}

              {/* Instructions */}
              <div className="space-y-4">
                <h4 className="font-semibold">Cómo configurar EmailJS:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                  <li>
                    Crea una cuenta gratuita en{" "}
                    <a 
                      href="https://www.emailjs.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      EmailJS.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    Crea un <strong>Email Service</strong> conectando tu proveedor de email (Gmail, Outlook, etc.)
                  </li>
                  <li>
                    Crea un <strong>Email Template</strong> con las variables: 
                    <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">{"{{from_name}}"}</code>,
                    <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">{"{{from_email}}"}</code>,
                    <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">{"{{message}}"}</code>
                  </li>
                  <li>
                    Copia los IDs y agrégalos como variables de entorno.
                  </li>
                </ol>
              </div>

              <Separator />

              {/* Environment Variables */}
              <div className="space-y-4">
                <h4 className="font-semibold">Variables de Entorno:</h4>
                <div className="space-y-3">
                  <EnvVarStatus 
                    name="NEXT_PUBLIC_EMAILJS_SERVICE_ID"
                    configured={INTEGRATIONS_STATUS.emailjs.serviceId}
                    description="ID del servicio de email (ej: service_xxxxxx)"
                  />
                  <EnvVarStatus 
                    name="NEXT_PUBLIC_EMAILJS_TEMPLATE_ID"
                    configured={INTEGRATIONS_STATUS.emailjs.templateId}
                    description="ID de la plantilla de email (ej: template_xxxxxx)"
                  />
                  <EnvVarStatus 
                    name="NEXT_PUBLIC_EMAILJS_PUBLIC_KEY"
                    configured={INTEGRATIONS_STATUS.emailjs.publicKey}
                    description="Clave pública de tu cuenta EmailJS"
                  />
                </div>
              </div>

              <Separator />

              {/* Template Example */}
              <div className="space-y-3">
                <h4 className="font-semibold">Ejemplo de Template en EmailJS:</h4>
                <div className="rounded-lg border bg-muted p-4">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
{`Asunto: Nuevo mensaje de contacto de {{from_name}}

Has recibido un nuevo mensaje desde el formulario de contacto:

Nombre: {{from_name}}
Email: {{from_email}}

Mensaje:
{{message}}

---
Este mensaje fue enviado desde tu sitio web.`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wompi Tab */}
        <TabsContent value="wompi">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Wompi</CardTitle>
                    <CardDescription>Pasarela de pagos para Colombia y Latinoamérica</CardDescription>
                  </div>
                </div>
                <StatusBadge configured={wompiConfigured} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              {!wompiConfigured && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Configuración incompleta</AlertTitle>
                  <AlertDescription>
                    Los pagos no funcionarán hasta que configures las credenciales de Wompi.
                  </AlertDescription>
                </Alert>
              )}

              {/* Instructions */}
              <div className="space-y-4">
                <h4 className="font-semibold">Cómo configurar Wompi:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                  <li>
                    Crea una cuenta en{" "}
                    <a 
                      href="https://comercios.wompi.co/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Wompi Comercios
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    Ve a <strong>Desarrolladores &gt; Llaves de API</strong> en el panel de Wompi
                  </li>
                  <li>
                    Copia las llaves de <strong>Sandbox</strong> para pruebas o <strong>Producción</strong> para pagos reales
                  </li>
                  <li>
                    Configura el webhook de eventos apuntando a tu endpoint de eventos
                  </li>
                </ol>
              </div>

              <Separator />

              {/* Environment Variables */}
              <div className="space-y-4">
                <h4 className="font-semibold">Variables de Entorno:</h4>
                <div className="space-y-3">
                  <EnvVarStatus 
                    name="NEXT_PUBLIC_WOMPI_PUBLIC_KEY"
                    configured={INTEGRATIONS_STATUS.wompi.publicKey}
                    description="Llave pública de Wompi (pub_xxxxx)"
                  />
                  <EnvVarStatus 
                    name="WOMPI_PRIVATE_KEY"
                    configured={INTEGRATIONS_STATUS.wompi.privateKey}
                    description="Llave privada de Wompi (prv_xxxxx) - Solo servidor"
                  />
                  <EnvVarStatus 
                    name="WOMPI_EVENTS_SECRET"
                    configured={INTEGRATIONS_STATUS.wompi.eventsSecret}
                    description="Secreto para verificar webhooks de eventos"
                  />
                </div>
              </div>

              <Separator />

              {/* Webhook Info */}
              <div className="space-y-3">
                <h4 className="font-semibold">Configuración de Webhook:</h4>
                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Configura el siguiente URL en el panel de Wompi para recibir notificaciones de pago:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-background px-3 py-2 text-sm">
                      {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/wompi` : 'https://tu-dominio.com/api/webhooks/wompi'}
                    </code>
                    <CopyButton text="/api/webhooks/wompi" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Test Cards */}
              <div className="space-y-3">
                <h4 className="font-semibold">Tarjetas de Prueba (Sandbox):</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium text-green-600">Aprobada</p>
                    <code className="text-xs">4242 4242 4242 4242</code>
                    <p className="text-xs text-muted-foreground">CVV: 123, Fecha: cualquier futura</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium text-red-600">Rechazada</p>
                    <code className="text-xs">4111 1111 1111 1111</code>
                    <p className="text-xs text-muted-foreground">CVV: 123, Fecha: cualquier futura</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supabase Tab */}
        <TabsContent value="supabase">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <Database className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Supabase</CardTitle>
                    <CardDescription>Base de datos PostgreSQL y autenticación</CardDescription>
                  </div>
                </div>
                <StatusBadge configured={supabaseConfigured} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              {supabaseConfigured ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle>Conexión activa</AlertTitle>
                  <AlertDescription>
                    La base de datos está conectada y funcionando correctamente.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Sin conexión</AlertTitle>
                  <AlertDescription>
                    La aplicación no puede conectarse a la base de datos. Configura las credenciales de Supabase.
                  </AlertDescription>
                </Alert>
              )}

              {/* Instructions */}
              <div className="space-y-4">
                <h4 className="font-semibold">Cómo configurar Supabase:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                  <li>
                    Crea un proyecto en{" "}
                    <a 
                      href="https://supabase.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Supabase.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    Ve a <strong>Settings &gt; API</strong> en tu proyecto de Supabase
                  </li>
                  <li>
                    Copia el <strong>Project URL</strong> y la <strong>anon public key</strong>
                  </li>
                  <li>
                    Ejecuta las migraciones SQL necesarias para crear las tablas
                  </li>
                </ol>
              </div>

              <Separator />

              {/* Environment Variables */}
              <div className="space-y-4">
                <h4 className="font-semibold">Variables de Entorno:</h4>
                <div className="space-y-3">
                  <EnvVarStatus 
                    name="NEXT_PUBLIC_SUPABASE_URL"
                    configured={INTEGRATIONS_STATUS.supabase.url}
                    description="URL de tu proyecto Supabase (https://xxxxx.supabase.co)"
                  />
                  <EnvVarStatus 
                    name="NEXT_PUBLIC_SUPABASE_ANON_KEY"
                    configured={INTEGRATIONS_STATUS.supabase.anonKey}
                    description="Clave anónima pública de Supabase"
                  />
                </div>
              </div>

              <Separator />

              {/* Migration Info */}
              <div className="space-y-3">
                <h4 className="font-semibold">Migraciones de Base de Datos:</h4>
                <p className="text-sm text-muted-foreground">
                  Si necesitas ejecutar migraciones, los scripts SQL se encuentran en la carpeta <code className="rounded bg-muted px-1 py-0.5">/scripts</code> del proyecto.
                  Ejecútalos en orden en el SQL Editor de Supabase.
                </p>
                <div className="rounded-lg border bg-amber-50 p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> En el futuro, esta aplicación podría migrar a otro proveedor de base de datos.
                    La arquitectura de repositorios permite cambiar el backend sin modificar los componentes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
