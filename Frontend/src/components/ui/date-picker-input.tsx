import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerInputProps {
  value: string // formato YYYY-MM-DD ou vazio
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function DatePickerInput({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "dd/mm/aaaa",
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  // Sincroniza inputValue quando o value prop mudar (ex: "2026-11-04" -> "04/11/2026")
  React.useEffect(() => {
    if (!value) {
      setInputValue("")
      return
    }
    const [y, m, d] = value.split("-").map(Number)
    if (y && m && d) {
      const dt = new Date(y, m - 1, d)
      if (isValid(dt)) {
        setInputValue(format(dt, "dd/MM/yyyy"))
        return
      }
    }
    setInputValue("")
  }, [value])

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    const [y, m, d] = value.split("-").map(Number)
    if (!y || !m || !d) return undefined
    const dt = new Date(y, m - 1, d)
    return isValid(dt) ? dt : undefined
  }, [value])

  // Aplica máscara automática dd/mm/aaaa
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "")
    if (raw.length > 8) raw = raw.slice(0, 8)

    let masked = raw
    if (raw.length > 2 && raw.length <= 4) {
      masked = `${raw.slice(0, 2)}/${raw.slice(2)}`
    } else if (raw.length > 4) {
      masked = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`
    }

    setInputValue(masked)

    if (masked.length === 10) {
      const parsed = parse(masked, "dd/MM/yyyy", new Date())
      if (isValid(parsed)) {
        onChange(format(parsed, "yyyy-MM-dd"))
        return
      }
    } else if (masked.length === 0) {
      onChange("")
    }
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && isValid(newDate)) {
      onChange(format(newDate, "yyyy-MM-dd"))
      setInputValue(format(newDate, "dd/MM/yyyy"))
    } else {
      onChange("")
      setInputValue("")
    }
    setIsOpen(false)
  }

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <input
        type="text"
        disabled={disabled}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        maxLength={10}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 pr-10 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="absolute right-2 p-1 text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label="Abrir calendário"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white dark:bg-[#1e1f29] dark:border-gray-800 z-[70] shadow-xl border"
          align="end"
          side="bottom"
          sideOffset={6}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
