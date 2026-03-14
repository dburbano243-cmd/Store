"use client"

import { useState, useEffect } from "react"
import { Layers, RefreshCw, Check, AlertCircle, Shield, AlertTriangle, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddComponentModal } from "@/components/admin/page-builder/AddComponentModal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ComponentType } from "@/lib/types/page-builder.types"
import { componentMetadata, componentCategories } from "@/components/admin/page-builder/ComponentRegistry"

interface SyncStatus {
  missingInDb: Array<{ name: string; label: string; icon: string; description: string }>
  orphanedInDb: ComponentType[]
  synced: ComponentType[]
}

interface ComponentsResponse {
  registered: ComponentType[]
  allowed: Array<{ name: string; label: string; icon: string; description: string }>
  syncStatus: SyncStatus
}

export default function ComponentsPage() {
  const [data, setData] = useState<ComponentsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<{
    success: boolean
    created: string[]
    existing: string[]
    skipped: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchComponentTypes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/admin/components")
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Error al cargar los componentes")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedComponents = async () => {
    try {
      setIsSeeding(true)
      setSeedResult(null)
      setError(null)
      
      const response = await fetch("/api/admin/components/seed", {
        method: "POST",
      })
      const result = await response.json()
      
      if (result.success) {
        setSeedResult({
          success: true,
          created: result.data.created,
          existing: result.data.existing,
          skipped: result.data.skipped || [],
        })
        await fetchComponentTypes()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Error al sincronizar componentes")
      console.error(err)
    } finally {
      setIsSeeding(false)
    }
  }

  useEffect(() => {
    fetchComponentTypes()
  }, [])

  const getComponentLabel = (name: string) => {
    return componentMetadata[name]?.label || name
  }

  const getComponentDescription = (name: string) => {
    return componentMetadata[name]?.description || "Sin descripción"
  }

  const getCategoryForComponent = (name: string): string => {
    for (const [, category] of Object.entries(componentCategories)) {
      if (category.components.includes(name)) {
        return category.label
      }
    }
    return "Sin categoría"
  }

  const componentTypes = data?.registered || []
  const syncStatus = data?.syncStatus
  const hasOrphans = (syncStatus?.orphanedInDb.length || 0) > 0
  const hasMissing = (syncStatus?.missingInDb.length || 0) > 0

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Componentes</h1>
          <p className="text-muted-foreground">
            Gestiona los tipos de componentes disponibles para el Page Builder
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchComponentTypes}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={handleSeedComponents} disabled={isSeeding}>
            {isSeeding ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Sincronizar desde Registry
          </Button>
          <AddComponentModal onComponentCreated={fetchComponentTypes} />
        </div>
      </div>

      {/* Security Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Protección de Componentes</AlertTitle>
        <AlertDescription>
          Solo se pueden sincronizar componentes que existen en el <code className="bg-muted px-1 rounded">ComponentRegistry</code> (whitelist).
          La creación manual de componentes está deshabilitada por seguridad.
          El contenido de cada componente se valida con schemas Zod antes de guardarse.
        </AlertDescription>
      </Alert>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {seedResult && (
        <Alert variant="default">
          <Check className="h-4 w-4" />
          <AlertTitle>Sincronización completada</AlertTitle>
          <AlertDescription>
            {seedResult.created.length > 0 && (
              <span className="block">
                Creados: {seedResult.created.join(", ")}
              </span>
            )}
            {seedResult.existing.length > 0 && (
              <span className="block text-muted-foreground">
                Ya sincronizados: {seedResult.existing.join(", ")}
              </span>
            )}
            {seedResult.skipped.length > 0 && (
              <span className="block text-amber-600">
                Omitidos (sin configuración): {seedResult.skipped.join(", ")}
              </span>
            )}
            {seedResult.created.length === 0 && seedResult.existing.length > 0 && (
              <span className="block">Todos los componentes ya estaban sincronizados.</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Orphaned Components Warning */}
      {hasOrphans && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Componentes huérfanos detectados</AlertTitle>
          <AlertDescription>
            Los siguientes componentes están en la base de datos pero NO en el ComponentRegistry.
            Esto puede representar un riesgo de seguridad o componentes obsoletos:
            <span className="block mt-2 font-mono text-sm">
              {syncStatus?.orphanedInDb.map(c => c.name).join(", ")}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En Registry (Whitelist)
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.allowed.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Componentes permitidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sincronizados
            </CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {syncStatus?.synced.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              En Registry y en DB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendientes
            </CardTitle>
            <Layers className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {syncStatus?.missingInDb.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              En Registry, falta en DB
            </p>
          </CardContent>
        </Card>
        <Card className={hasOrphans ? "border-destructive" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Huérfanos
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${hasOrphans ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasOrphans ? "text-destructive" : ""}`}>
              {syncStatus?.orphanedInDb.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              En DB, no en Registry
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Components Table */}
      <Card>
        <CardHeader>
          <CardTitle>Componentes Registrados en Base de Datos</CardTitle>
          <CardDescription>
            Lista de componentes disponibles para usar en el Page Builder.
            Solo los componentes sincronizados (checkmark verde) pueden ser usados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : componentTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Layers className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay componentes sincronizados</h3>
              <p className="text-muted-foreground mb-4">
                Haz clic en &quot;Sincronizar desde Registry&quot; para agregar los componentes del código a la base de datos.
              </p>
              <Button onClick={handleSeedComponents} disabled={isSeeding}>
                {isSeeding ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Sincronizar Componentes
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Estado</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {componentTypes.map((component) => {
                  const isInRegistry = data?.allowed.some(a => a.name === component.name)
                  return (
                    <TableRow key={component.id} className={!isInRegistry ? "bg-destructive/10" : ""}>
                      <TableCell>
                        {isInRegistry ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {component.name}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getComponentLabel(component.name)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isInRegistry ? "secondary" : "destructive"}>
                          {isInRegistry ? getCategoryForComponent(component.name) : "NO EN REGISTRY"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                        {getComponentDescription(component.name)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sync Status */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Sincronización</CardTitle>
            <CardDescription>
              Comparación entre los componentes del código (Registry/Whitelist) y la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Missing in DB */}
              {hasMissing && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-amber-500" />
                    Pendientes de sincronizar
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Estos componentes existen en el código pero aún no están en la base de datos.
                    Haz clic en &quot;Sincronizar desde Registry&quot; para agregarlos.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {syncStatus?.missingInDb.map((component) => (
                      <Badge key={component.name} variant="outline" className="border-amber-500">
                        {component.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Synced */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Sincronizados correctamente
                </h4>
                <div className="flex flex-wrap gap-2">
                  {syncStatus?.synced.map((component) => (
                    <Badge key={component.id} variant="default">
                      <Check className="h-3 w-3 mr-1" />
                      {getComponentLabel(component.name)}
                    </Badge>
                  ))}
                  {(syncStatus?.synced.length || 0) === 0 && (
                    <span className="text-sm text-muted-foreground">Ninguno sincronizado aún</span>
                  )}
                </div>
              </div>

              {/* Categories breakdown */}
              <div>
                <h4 className="font-medium mb-2">Por Categorías</h4>
                <div className="space-y-3">
                  {Object.entries(componentCategories).map(([key, category]) => (
                    <div key={key} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-24">{category.label}:</span>
                      <div className="flex flex-wrap gap-1">
                        {category.components.map((componentName) => {
                          const isInDb = componentTypes.some(ct => ct.name === componentName)
                          return (
                            <Badge
                              key={componentName}
                              variant={isInDb ? "default" : "outline"}
                              className={`text-xs ${!isInDb ? "border-dashed opacity-60" : ""}`}
                            >
                              {isInDb && <Check className="h-2 w-2 mr-1" />}
                              {componentMetadata[componentName]?.label || componentName}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
