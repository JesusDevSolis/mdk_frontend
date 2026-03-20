/**
 * useDisciplinas
 * Hook que carga las disciplinas desde el backend (con sus logos) una sola vez.
 * Provee también un helper para buscar por slug/value.
 */
import { useState, useEffect } from 'react'
import { disciplinasAPI } from '../services/APIservice'

// Fallback hardcoded — se usa cuando no hay logo en BD
export const DISCIPLINA_FALLBACK = {
  'tae-kwon-do':       { label: 'Tae Kwon Do',       emoji: '🥋', color: 'bg-blue-100 text-blue-800',   border: 'border-blue-200'   },
  'tang-soo-do':       { label: 'Tang Soo Do',        emoji: '🥊', color: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
  'hapkido':           { label: 'Hapkido',            emoji: '🤸', color: 'bg-green-100 text-green-800',  border: 'border-green-200'  },
  'gumdo':             { label: 'Gumdo',              emoji: '⚔️', color: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
  'pequenos-dragones': { label: 'Pequeños Dragones',  emoji: '🐉', color: 'bg-amber-100 text-amber-800',  border: 'border-amber-200'  },
}

let _cache = null // cache global para no recargar en cada componente

const useDisciplinas = () => {
  const [disciplinas, setDisciplinas] = useState(_cache || [])
  const [loading, setLoading]         = useState(!_cache)

  useEffect(() => {
    if (_cache) return
    disciplinasAPI.getAll()
      .then(res => {
        const data = res?.data || []
        _cache = data
        setDisciplinas(data)
      })
      .catch(() => setDisciplinas([]))
      .finally(() => setLoading(false))
  }, [])

  /**
   * Dado un slug de programa (ej. 'tae-kwon-do'), devuelve:
   * { label, emoji, color, border, logoUrl }
   */
  const getDisciplina = (slug) => {
    const fallback = DISCIPLINA_FALLBACK[slug] || { label: slug, emoji: '🥋', color: 'bg-gray-100 text-gray-700', border: 'border-gray-200' }
    if (!disciplinas.length) return { ...fallback, logoUrl: null }

    // El slug en la BD puede venir como 'slug' o coincidir con el nombre
    const disc = disciplinas.find(
      d => d.slug === slug || d.nombre?.toLowerCase().replace(/\s+/g, '-') === slug
    )
    return {
      ...fallback,
      logoUrl: disc?.logoUrl || null
    }
  }

  return { disciplinas, loading, getDisciplina }
}

export default useDisciplinas