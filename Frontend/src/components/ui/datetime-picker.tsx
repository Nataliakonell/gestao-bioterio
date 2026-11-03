import * as React from "react"
import { format, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function DateTimePicker({
  date,
  setDate,
  disabled,
  className,
  placeholder = "DD/MM/AAAA HH:mm",
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [timeValue, setTimeValue] = React.useState<string>(
    date && isValid(date) ? format(date, "HH:mm") : ""
  )
  const [inputValue, setInputValue] = React.useState<string>(
    date && isValid(date) ? format(date, "dd/MM/yyyy HH:mm") : ""
  )
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (date && isValid(date)) {
      setSelectedDate(date)
      setTimeValue(format(date, "HH:mm"))
      setInputValue(format(date, "dd/MM/yyyy HH:mm"))
    } else {
      setSelectedDate(undefined)
      setTimeValue("")
      setInputValue("")
    }
  }, [date])

  const parseAndApply = (val: string) => {
    const trimmed = val.trim()
    if (!trimmed) {
      setSelectedDate(undefined)
      setTimeValue("")
      setDate(undefined)
      return
    }

    const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/)
    if (match) {
      const day = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1
      const year = parseInt(match[3], 10)
      const hours = match[4] !== undefined ? parseInt(match[4], 10) : 0
      const minutes = match[5] !== undefined ? parseInt(match[5], 10) : 0

      if (
        month >= 0 &&
        month <= 11 &&
        day >= 1 &&
        day <= 31 &&
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59 &&
        year >= 1900 &&
        year <= 2100
      ) {
        const parsed = new Date(year, month, day, hours, minutes)
        if (isValid(parsed) && parsed.getDate() === day) {
          const hhmm = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
          setSelectedDate(parsed)
          setTimeValue(hhmm)
          setDate(parsed)
        }
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    parseAndApply(val)
  }

  const handleInputBlur = () => {
    if (date && isValid(date)) {
      setInputValue(format(date, "dd/MM/yyyy HH:mm"))
    } else if (!inputValue.trim()) {
      setInputValue("")
      setSelectedDate(undefined)
      setTimeValue("")
      setDate(undefined)
    }
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const updatedDate = new Date(newDate)
      const [hours, minutes] = (timeValue || "00:00").split(":")
      updatedDate.setHours(parseInt(hours || "0", 10), parseInt(minutes || "0", 10), 0, 0)
      setSelectedDate(updatedDate)
      setDate(updatedDate)
      setInputValue(format(updatedDate, "dd/MM/yyyy HH:mm"))
    } else {
      setSelectedDate(undefined)
      setDate(undefined)
      setInputValue("")
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTimeValue(newTime)

    const baseDate = selectedDate || new Date()
    if (newTime) {
      const [hours, minutes] = newTime.split(":")
      const updatedDate = new Date(baseDate)
      updatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
      setSelectedDate(updatedDate)
      setDate(updatedDate)
      setInputValue(format(updatedDate, "dd/MM/yyyy HH:mm"))
    }
  }

  return (
    <div
      className={cn(
        "relative flex items-center w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-card focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Input
        type="text"
        disabled={disabled}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full h-10 border-0 bg-transparent px-3 text-sm text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10"
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 p-0"
            title="Abrir calendário"
            tabIndex={-1}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white dark:bg-[#1e1f29] dark:border-gray-800 z-[70] shadow-xl border"
          align="end"
          side="bottom"
          sideOffset={8}
          collisionPadding={16}
          avoidCollisions
          sticky="always"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            locale={ptBR}
          />
          <div className="p-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-200">Horário</span>
            </div>
            <Input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="w-[100px] h-8 text-sm bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-slate-800 dark:text-zinc-100"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
