import React from "react"

export default function ShippingPage() {
  return (
    <section className="flex-1 pt-16 max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4 pt-16">Envíos y Devoluciones</h1>

      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Envíos</h2>
        <p className="text-gray-700">
          Procesamos los pedidos en un plazo de 1–3 días hábiles. Los tiempos de entrega
          dependen del servicio de mensajería seleccionado y la ubicación del destinatario.
          Proporcionamos número de seguimiento cuando esté disponible.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Devoluciones</h2>
        <p className="text-gray-700 mb-2">
          Solo aceptamos devoluciones cuando el producto llega dañado o con defectos.
          Debes reportar el problema dentro de los 7 días hábiles posteriores a la
          recepción y adjuntar evidencia (fotografías o video). No se aceptan devoluciones
          por cambio de opinión ni por producto abierto.
        </p>
        <p className="text-gray-700">
          Una vez evaluada la evidencia, coordinaremos la devolución o reembolso. Los
          costos de envío de la devolución serán asumidos por nosotros si el daño fue
          comprobado; si no, los costos correrán por cuenta del cliente.
        </p>
      </section>
    </section>
  )
}
