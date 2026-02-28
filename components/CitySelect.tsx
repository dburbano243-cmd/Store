"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown, X } from "lucide-react"
import { COLOMBIAN_CITIES } from "@/lib/colombian-cities"

interface CitySelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  id?: string
  required?: boolean
}

export default function CitySelect({
  value,
  onChange,
  className = "",
  placeholder = "Busca tu ciudad...",
  id,
  required,
}: CitySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = search.trim()
    ? COLOMBIAN_CITIES.filter((city) =>
        city.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 50)
    : COLOMBIAN_CITIES.slice(0, 50)

  const handleSelect = useCallback(
    (city: string) => {
      onChange(city)
      setSearch("")
      setIsOpen(false)
    },
    [onChange]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange("")
      setSearch("")
      setIsOpen(false)
    },
    [onChange]
  )

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden native input for form validation */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          value={value}
          onChange={() => {}}
          required
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        />
      )}

      <div
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        className={`flex items-center cursor-pointer ${className}`}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            autoComplete="off"
          />
        ) : (
          <span className={`flex-1 text-sm truncate ${value ? "text-foreground" : "text-muted-foreground"}`}>
            {value || placeholder}
          </span>
        )}

        {value && !isOpen ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground ml-1 flex-shrink-0"
            aria-label="Limpiar ciudad"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </div>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-popover border border-border rounded-lg shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No se encontraron ciudades</li>
          ) : (
            filtered.map((city) => (
              <li
                key={city}
                role="option"
                aria-selected={city === value}
                onClick={() => handleSelect(city)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground ${
                  city === value ? "bg-accent/50 font-medium" : "text-foreground"
                }`}
              >
                {city}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
