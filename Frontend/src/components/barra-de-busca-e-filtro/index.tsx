import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, Filter, CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { type DateRange } from "react-day-picker"
import { SearchableSelect } from "@/components/ui/searchable-select"

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterSection {
  key: string
  label: string
  type: "checkbox" | "dateRange" | "date" | "select" | "radio"
  options?: FilterOption[]
  selected?: string[]
  onChange?: (values: string[]) => void
  dateRange?: DateRange | undefined
  onDateRangeChange?: (range: DateRange | undefined) => void
  date?: Date | undefined
  onDateChange?: (date: Date | undefined) => void
  selectedValue?: string
  onValueChange?: (value: string) => void
}

interface BarraDeBuscaEFiltroProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  filterSections?: FilterSection[]
}

export function BarraDeBuscaEFiltro({
  search,
  onSearchChange,
  placeholder = "Buscar...",
  filterSections = [],
}: BarraDeBuscaEFiltroProps) {
  const [isOpen, setIsOpen] = useState(false)

  const totalActiveFilters = filterSections.reduce((acc, section) => {

    if (section.type === "select" || section.type === "radio") {
      return acc + (section.selectedValue ? 1 : 0)
    }
    if (section.type === "checkbox") {
      return acc + (section.selected?.length ?? 0)
    }
    if (section.type === "dateRange") {
      return acc + (section.dateRange?.from ? 1 : 0)
    }
    if (section.type === "date") {
      return acc + (section.date ? 1 : 0)
    }
    return acc
  }, 0)

  const clearAllFilters = () => {
    filterSections.forEach((section) => {
      if (section.type === "checkbox") section.onChange?.([])
      if (section.type === "dateRange") section.onDateRangeChange?.(undefined)
      if (section.type === "date") section.onDateChange?.(undefined)
      if (section.type === "select") section.onValueChange?.("")
    })
  }

  const handleCheckboxChange = (section: FilterSection, value: string, checked: boolean) => {
    const current = section.selected ?? []
    const next = checked ? [...current, value] : current.filter((v) => v !== value)
    section.onChange?.(next)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return null
    return format(date, "dd/MM/yyyy", { locale: ptBR })
  }

  return (
    <div className="flex flex-row gap-3 w-full sm:w-auto sm:ml-auto">
      {/* Search bar */}
      <div className="relative flex-1 sm:w-80 md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-400" />
        <Input
          placeholder={placeholder}
          className="h-11 pl-10 rounded-xl w-full bg-white dark:bg-card border-gray-200 dark:border-gray-800 shadow-sm text-zinc-100 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-400"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter popover */}
      {filterSections.length > 0 && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-11 px-4 rounded-xl flex items-center gap-2 shrink-0 bg-white dark:bg-card border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <Filter className="h-4 w-4 text-zinc-300 dark:text-zinc-300" />
              <span className="text-sm text-zinc-200 dark:text-zinc-200">Filtro</span>
              {totalActiveFilters > 0 && (
                <span className="bg-blue-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {totalActiveFilters}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-84 sm:w-96 p-0 bg-white dark:bg-[#1e1f29] shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[min(var(--radix-popover-content-available-height,calc(100vh-2rem)),520px)] overflow-hidden z-50"
            align="end"
            sideOffset={8}
            collisionPadding={16}
          >
            {/* Header fixo */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-zinc-800/50 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-zinc-100 dark:text-zinc-100">Filtros</h3>
                {totalActiveFilters > 0 && (
                  <span className="bg-blue-800 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {totalActiveFilters}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {totalActiveFilters > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-semibold hover:underline cursor-pointer"
                  >
                    Limpar tudo
                  </button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 p-0 rounded-lg hover:bg-gray-200/60 dark:hover:bg-zinc-700/60"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Corpo rolável com seções */}
            <div className="p-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              {/* Sections */}
              {filterSections.map((section, idx) => (
                <div
                  key={section.key}
                  className={`pb-4 mb-4 ${idx < filterSections.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}
                >
                  <label className="text-sm font-medium text-zinc-300 dark:text-zinc-300 mb-2 block">
                    {section.label}
                  </label>

                  {/* Checkbox group */}
                  {section.type === "checkbox" && section.options && (
                    <div className="space-y-2">
                      {section.options.map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${section.key}-${opt.value}`}
                            checked={section.selected?.includes(opt.value) ?? false}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(section, opt.value, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`${section.key}-${opt.value}`}
                            className="text-sm cursor-pointer text-zinc-200 dark:text-zinc-200 flex items-center gap-2"
                          >
                            {opt.label}
                            {opt.count !== undefined && (
                              <span className="bg-blue-800 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                {opt.count}
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  {section.type === "select" && section.options && (
                    <div className="space-y-2">
                      <SearchableSelect
                        value={section.selectedValue ?? ""}
                        options={section.options}
                        onChange={(value) => section.onValueChange?.(value)}
                        placeholder={`Selecionar ${section.label.toLowerCase()}`}
                        isClearable
                      />
                    </div>
                  )}

                  {/* Radio group */}
                  {section.type === "radio" && section.options && (
                    <RadioGroup 
                      value={section.selectedValue} 
                      onValueChange={section.onValueChange}
                      className="space-y-2"
                    >
                      {section.options.map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.value} id={`${section.key}-${opt.value}`} />
                          <label
                            htmlFor={`${section.key}-${opt.value}`}
                            className="text-sm cursor-pointer text-zinc-200 dark:text-zinc-200"
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Date range picker */}
                  {section.type === "dateRange" && (
                    <div className="space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal text-sm h-10 rounded-lg dark:bg-card dark:border-gray-800 text-zinc-100 dark:text-zinc-100"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400 dark:text-zinc-400" />
                            {section.dateRange?.from ? (
                              section.dateRange.to ? (
                                <>
                                  {format(section.dateRange.from, "dd/MM/yy")} –{" "}
                                  {format(section.dateRange.to, "dd/MM/yy")}
                                </>
                              ) : (
                                format(section.dateRange.from, "dd/MM/yyyy")
                              )
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-400">Selecionar período</span>
                            )}
                            {section.dateRange?.from && (
                              <X
                                className="ml-auto h-3.5 w-3.5 text-zinc-400 hover:text-zinc-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  section.onDateRangeChange?.(undefined)
                                }}
                              />
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white dark:bg-[#1e1f29] dark:border-gray-800" align="start">
                          <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex gap-2">
                            <div className="flex-1">
                              <label className="text-xs text-zinc-300 dark:text-zinc-300 mb-1 block">De</label>
                              <Input
                                type="date"
                                className="h-8 text-sm text-zinc-100 dark:text-zinc-100"
                                value={section.dateRange?.from ? format(section.dateRange.from, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                  const val = e.target.value
                                  if (!val) {
                                    section.onDateRangeChange?.({ ...section.dateRange, from: undefined })
                                  } else {
                                    const d = new Date(val + "T12:00:00")
                                    section.onDateRangeChange?.({ ...section.dateRange, from: d })
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-zinc-300 dark:text-zinc-300 mb-1 block">Até</label>
                              <Input
                                type="date"
                                className="h-8 text-sm text-zinc-100 dark:text-zinc-100"
                                value={section.dateRange?.to ? format(section.dateRange.to, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                  const val = e.target.value
                                  if (!val) {
                                    section.onDateRangeChange?.({ ...section.dateRange, to: undefined })
                                  } else {
                                    const d = new Date(val + "T12:00:00")
                                    section.onDateRangeChange?.({ ...section.dateRange, to: d })
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={section.dateRange?.from}
                            selected={section.dateRange}
                            onSelect={section.onDateRangeChange}
                            numberOfMonths={1}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {/* Single date picker */}
                  {section.type === "date" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal text-sm h-10 rounded-lg dark:bg-card dark:border-gray-800 text-zinc-100 dark:text-zinc-100"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400 dark:text-zinc-400" />
                          {formatDate(section.date) ?? (
                            <span className="text-zinc-400 dark:text-zinc-400">Selecionar data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white dark:bg-[#1e1f29] dark:border-gray-800" align="start">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                          <label className="text-xs text-zinc-300 dark:text-zinc-300 mb-1 block">Data</label>
                          <Input
                            type="date"
                            className="h-8 text-sm text-zinc-100 dark:text-zinc-100"
                            value={section.date ? format(section.date, "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                              const val = e.target.value
                              if (!val) {
                                section.onDateChange?.(undefined)
                              } else {
                                const d = new Date(val + "T12:00:00")
                                section.onDateChange?.(d)
                              }
                            }}
                          />
                        </div>
                        <Calendar
                          mode="single"
                          selected={section.date}
                          onSelect={section.onDateChange}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              ))}
            </div>

            {/* Footer fixo sempre visível */}
            {totalActiveFilters > 0 && (
              <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-zinc-800/50 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full h-9 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50 transition"
                >
                  Limpar todos os filtros ({totalActiveFilters})
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
