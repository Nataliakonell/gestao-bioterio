import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
}

export function DatePicker({ date, setDate, disabled, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-zinc-100 dark:text-zinc-100",
            !date && "text-zinc-400 dark:text-zinc-400",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400 dark:text-zinc-400" />
          {date ? (
            format(date, "dd/MM/yyyy", { locale: ptBR })
          ) : (
            <span className="text-zinc-400 dark:text-zinc-400">Selecione a data</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-[#1e1f29] dark:border-gray-800 z-[70] shadow-xl border" align="start" side="bottom" sideOffset={8} collisionPadding={16} avoidCollisions sticky="always">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}
