/**
 * useCinturones
 * Carga los niveles de cinturón desde configuracionesAPI (clave: cinturones_niveles)
 * con caché global para no hacer múltiples peticiones.
 * 
 * Retorna: { cinturones: [{ key, nombre, color, textDark }], loading }
 */
import { useState, useEffect } from 'react'
import { configuracionesAPI } from '../services/APIservice'

// Cache global — se comparte entre todas las instancias del hook en la misma sesión
let _cache = null
let _loading = false
let _listeners = []

const FALLBACK = [
  { key: 'principiante',    nombre: 'Principiante (sin grado)', color: '#F3F4F6', textDark: true  },
  { key: 'blanca-chobocha', nombre: 'Blanca (Chobocha)',        color: '#FFFFFF', textDark: true  },
  { key: 'blanca-1',        nombre: 'Blanca 1er nivel',         color: '#FFFFFF', textDark: true  },
  { key: 'blanca-2',        nombre: 'Blanca 2do nivel',         color: '#FFFFFF', textDark: true  },
  { key: 'blanca-3',        nombre: 'Blanca 3er nivel',         color: '#FFFFFF', textDark: true  },
  { key: 'blanca-avanzada', nombre: 'Blanca Avanzada',          color: '#FFFFFF', textDark: true  },
  { key: 'amarilla',        nombre: 'Amarilla',                 color: '#FDE047', textDark: true  },
  { key: 'amarilla-avanzada', nombre: 'Amarilla Avanzada',      color: '#EAB308', textDark: true  },
  { key: 'naranja',         nombre: 'Naranja',                  color: '#FB923C', textDark: false },
  { key: 'verde',           nombre: 'Verde',                    color: '#22C55E', textDark: false },
  { key: 'verde-avanzada',  nombre: 'Verde Avanzada',           color: '#16A34A', textDark: false },
  { key: 'azul',            nombre: 'Azul',                     color: '#3B82F6', textDark: false },
  { key: 'azul-avanzada',   nombre: 'Azul Avanzada',            color: '#2563EB', textDark: false },
  { key: 'morada',          nombre: 'Morada',                   color: '#A855F7', textDark: false },
  { key: 'marron',          nombre: 'Marrón',                   color: '#92400E', textDark: false },
  { key: 'marron-avanzada', nombre: 'Marrón Avanzada',          color: '#78350F', textDark: false },
  { key: 'roja',            nombre: 'Roja',                     color: '#EF4444', textDark: false },
  { key: 'roja-ieby',       nombre: 'Roja Ieby',                color: '#DC2626', textDark: false },
  { key: 'negra-1-poom',    nombre: 'Negra 1er Poom',           color: '#1C1917', textDark: false },
  { key: 'negra-2-poom',    nombre: 'Negra 2do Poom',           color: '#1C1917', textDark: false },
  { key: 'negra-3-poom',    nombre: 'Negra 3er Poom',           color: '#1C1917', textDark: false },
  { key: 'negra-1-dan',     nombre: 'Negra 1er Dan',            color: '#000000', textDark: false },
  { key: 'negra-2-dan',     nombre: 'Negra 2do Dan',            color: '#000000', textDark: false },
  { key: 'negra-3-dan',     nombre: 'Negra 3er Dan',            color: '#000000', textDark: false },
  { key: 'negra-4-dan',     nombre: 'Negra 4to Dan',            color: '#000000', textDark: false },
  { key: 'negra-5-dan',     nombre: 'Negra 5to Dan',            color: '#000000', textDark: false },
  { key: 'negra-6-dan',     nombre: 'Negra 6to Dan',            color: '#000000', textDark: false },
  { key: 'negra-7-dan',     nombre: 'Negra 7mo Dan',            color: '#000000', textDark: false },
  { key: 'negra-8-dan',     nombre: 'Negra 8vo Dan',            color: '#000000', textDark: false },
  { key: 'negra-9-dan',     nombre: 'Negra 9no Dan',            color: '#000000', textDark: false },
]

async function fetchCinturones() {
  if (_cache) return _cache
  if (_loading) {
    // Esperar a que termine la carga en curso
    return new Promise(resolve => _listeners.push(resolve))
  }
  _loading = true
  try {
    const res = await configuracionesAPI.getAgrupadas()
    if (res.success && res.data) {
      // Buscar en todas las categorías
      const allItems = Object.values(res.data).flat()
      const nivelesItem = allItems.find(i => i.clave === 'cinturones_niveles')
      if (nivelesItem?.valor) {
        const parsed = typeof nivelesItem.valor === 'string'
          ? JSON.parse(nivelesItem.valor)
          : nivelesItem.valor
        if (Array.isArray(parsed) && parsed.length > 0) {
          _cache = parsed
          _listeners.forEach(r => r(_cache))
          _listeners = []
          return _cache
        }
      }
    }
  } catch {}
  // Fallback a los niveles por defecto
  _cache = FALLBACK
  _listeners.forEach(r => r(_cache))
  _listeners = []
  return _cache
}

const useCinturones = () => {
  const [cinturones, setCinturones] = useState(_cache || [])
  const [loading, setLoading]       = useState(!_cache)

  useEffect(() => {
    if (_cache) { setCinturones(_cache); setLoading(false); return }
    fetchCinturones().then(data => {
      setCinturones(data)
      setLoading(false)
    })
  }, [])

  // Helper: obtener info de un cinturón por su key
  const getCinturon = (key) =>
    cinturones.find(c => c.key === key) ||
    { key, nombre: key, color: '#9CA3AF', textDark: false }

  return { cinturones, loading, getCinturon }
}

export default useCinturones