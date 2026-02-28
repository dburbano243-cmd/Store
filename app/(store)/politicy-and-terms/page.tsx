import React from "react"

export default function PolicyAndTermsPage() {
  return (
    <section className="flex-1 pt-16 max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4 pt-16">Política y Términos</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Productos importados</h2>
        <p className="text-gray-700">
          Nuestros productos son importados desde China. Hacemos todo el esfuerzo para que
          las descripciones y las fotografías reflejen con precisión los artículos, pero
          pueden existir pequeñas diferencias en color, textura o tamaño respecto a las
          imágenes mostradas. Estas variaciones no constituyen un defecto.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Descripción y veracidad</h2>
        <p className="text-gray-700">
          Siempre procuramos proporcionar descripciones claras y concisas. Antes de comprar,
          revisa la información del producto porque la compra se realiza sobre la base de
          la descripción publicada.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Devoluciones y garantía</h2>
        <p className="text-gray-700 mb-2">
          Aceptamos devoluciones únicamente cuando el producto llega dañado o con defectos
          de fábrica. No ofrecemos garantía adicional sobre el funcionamiento una vez el
          producto ha sido abierto y usado; la responsabilidad queda limitada a lo indicado
          anteriormente. No se aceptan devoluciones por diferencias menores entre la foto
          y el producto real.
        </p>
        <p className="text-gray-700">
          Para solicitar una devolución por producto dañado, el cliente debe reportarlo
          dentro de los 7 días hábiles siguientes a la recepción, proporcionando pruebas
          (fotografías o video) que permitan acreditar el daño. Las devoluciones después
          de haber sido abierto el empaque no serán aceptadas salvo acuerdo previo.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Limitación de responsabilidad</h2>
        <p className="text-gray-700">
          Excepto en los casos que la ley aplicable exija lo contrario, no ofrecemos
          garantías adicionales y nuestra responsabilidad por reclamaciones derivadas de
          la venta está limitada al valor del producto adquirido.
        </p>
      </section>
    </section>
  )
}
