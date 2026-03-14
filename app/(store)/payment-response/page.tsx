"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { useCart } from "@/hooks/useCart"

interface TransactionData {
  status: string
  reference: string
  amount_in_cents: number
  currency: string
}

function PaymentResponseContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [transaction, setTransaction] = useState<TransactionData | null>(null)
  const [loading, setLoading] = useState(true)
  const cartCleared = useRef(false)

  useEffect(() => {
    async function fetchTransaction() {
      // Wompi redirects with ?id=<transaction_id>
      const transactionId = searchParams.get("id")

      if (!transactionId) {
        setLoading(false)
        return
      }

      try {
        // Query Wompi's public API to get the transaction status
        const res = await fetch(
          `https://sandbox.wompi.co/v1/transactions/${transactionId}`
        )

        if (res.ok) {
          const data = await res.json()
          const txData = data?.data
          if (txData) {
            setTransaction({
              status: txData.status,
              reference: txData.reference,
              amount_in_cents: txData.amount_in_cents,
              currency: txData.currency,
            })

            // Clear cart on approved payment (only once)
            if (txData.status?.toUpperCase() === "APPROVED" && !cartCleared.current) {
              cartCleared.current = true
              clearCart()
            }
          }
        }
      } catch (err) {
        console.error("Error fetching Wompi transaction:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransaction()
  }, [searchParams, clearCart])

  const getStatusInfo = () => {
    const status = transaction?.status?.toUpperCase()

    switch (status) {
      case "APPROVED":
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "Pago Exitoso",
          message: "Tu pedido ha sido procesado correctamente.",
          color: "text-green-600",
          bgColor: "bg-green-50",
        }
      case "DECLINED":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "Pago Rechazado",
          message: "Tu pago no pudo ser procesado. Intenta nuevamente.",
          color: "text-red-600",
          bgColor: "bg-red-50",
        }
      case "VOIDED":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "Pago Anulado",
          message: "La transaccion fue anulada.",
          color: "text-red-600",
          bgColor: "bg-red-50",
        }
      case "ERROR":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "Error en el Pago",
          message: "Ocurrio un error al procesar tu pago. Intenta nuevamente.",
          color: "text-red-600",
          bgColor: "bg-red-50",
        }
      case "PENDING":
      default:
        return {
          icon: <Clock className="h-16 w-16 text-yellow-500" />,
          title: "Procesando Pago",
          message: "Tu pago esta siendo procesado. Te notificaremos pronto.",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Consultando el estado de tu pago...</p>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">{statusInfo.icon}</div>

        <h1 className={`text-2xl font-bold mb-4 ${statusInfo.color}`}>{statusInfo.title}</h1>

        <p className="text-gray-600 mb-6">{statusInfo.message}</p>

        {transaction && (
          <div className={`${statusInfo.bgColor} rounded-lg p-4 mb-6`}>
            <div className="text-sm text-gray-700 flex flex-col gap-1">
              <p>
                <strong>Referencia:</strong> {transaction.reference}
              </p>
              <p>
                <strong>Valor:</strong>{" "}
                {`$${(transaction.amount_in_cents / 100).toLocaleString("es-CO")} ${transaction.currency}`}
              </p>
              <p>
                <strong>Estado:</strong> {transaction.status}
              </p>
            </div>
          </div>
        )}

        {!transaction && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">
              No se pudo obtener informacion de la transaccion.
            </p>
          </div>
        )}

        <button
          onClick={() => (window.location.href = "/")}
          className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors"
        >
          Volver a la tienda
        </button>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}

export default function PaymentResponse() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentResponseContent />
    </Suspense>
  )
}
