/**
 * DisciplinaBadge
 * Muestra el logo de la disciplina si existe en BD,
 * si no muestra el emoji de fallback.
 *
 * Props:
 *   programa  - slug del programa ('tae-kwon-do', 'hapkido', ...)
 *   size      - 'sm' | 'md' | 'lg'  (default 'md')
 *   showLabel - boolean (default true)
 *   className - clases extra
 */
import React from 'react'
import useDisciplinas from '../../hooks/useDisciplinas'

const SIZES = {
  xs: { img: 'w-4 h-4',  emoji: 'text-xs',  pill: 'px-1.5 py-0.5 text-xs gap-1'   },
  sm: { img: 'w-5 h-5',  emoji: 'text-sm',  pill: 'px-2 py-0.5 text-xs gap-1.5'   },
  md: { img: 'w-6 h-6',  emoji: 'text-base', pill: 'px-2.5 py-1 text-sm gap-1.5'  },
  lg: { img: 'w-8 h-8',  emoji: 'text-xl',  pill: 'px-3 py-1.5 text-sm gap-2'     },
  xl: { img: 'w-10 h-10', emoji: 'text-2xl', pill: 'px-3 py-2 text-base gap-2'    },
}

// Solo ícono / logo sin pill
export const DisciplinaIcon = ({ programa, size = 'md', className = '' }) => {
  const { getDisciplina } = useDisciplinas()
  const disc = getDisciplina(programa)
  const sz   = SIZES[size] || SIZES.md

  if (disc.logoUrl) {
    return (
      <img
        src={disc.logoUrl}
        alt={disc.label}
        className={`${sz.img} object-contain rounded-sm ${className}`}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline' }}
      />
    )
  }
  return <span className={`${sz.emoji} leading-none ${className}`}>{disc.emoji}</span>
}

// Pill completo: logo/emoji + etiqueta
const DisciplinaBadge = ({ programa, size = 'md', showLabel = true, className = '' }) => {
  const { getDisciplina } = useDisciplinas()

  if (!programa) return null

  // Soporte para array de programas (v1.5 — alumno puede tener varios)
  const programas = Array.isArray(programa) ? programa : [programa]

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {programas.map(slug => {
        const disc = getDisciplina(slug)
        const sz   = SIZES[size] || SIZES.md

        return (
          <span
            key={slug}
            className={`inline-flex items-center rounded-full font-medium border ${disc.color} ${disc.border} ${sz.pill}`}
          >
            {disc.logoUrl ? (
              <img
                src={disc.logoUrl}
                alt={disc.label}
                className={`${sz.img} object-contain flex-shrink-0`}
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <span className={`${sz.emoji} leading-none flex-shrink-0`}>{disc.emoji}</span>
            )}
            {showLabel && <span>{disc.label}</span>}
          </span>
        )
      })}
    </div>
  )
}

export default DisciplinaBadge