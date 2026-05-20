'use client'  // Esto permite usar formularios interactivos

import { useState } from 'react'

export default function Contacto() {
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí conectarías con un servicio de email (Resend, EmailJS, etc.)
    setEnviado(true)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-bold text-pink-600 mb-6">Contacto</h1>
      
      {enviado ? (
        <div className="bg-green-100 p-4 rounded-lg">
          ¡Gracias! Te responderé pronto 💌
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Nombre</label>
            <input type="text" className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input type="email" className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block mb-1">Mensaje</label>
            <textarea rows={5} className="w-full border rounded p-2" required />
          </div>
          <button type="submit" className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600">
            Enviar mensaje
          </button>
        </form>
      )}
    </div>
  )
}