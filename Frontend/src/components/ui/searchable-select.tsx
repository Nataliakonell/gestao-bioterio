import ReactSelect, { type Props as ReactSelectProps } from "react-select"

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps
  extends Omit<ReactSelectProps<SearchableSelectOption>, "onChange" | "value"> {
  value?: string | null
  options: SearchableSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  isDisabled?: boolean
  isClearable?: boolean
}

export function SearchableSelect({
  value,
  options,
  onChange,
  placeholder = "Selecione",
  isDisabled = false,
  isClearable = false,
  ...rest
}: SearchableSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value) ?? null

  return (
    <ReactSelect
      options={options}
      value={selectedOption}
      onChange={(selected) => onChange(selected ? selected.value : "")}
      isDisabled={isDisabled}
      isClearable={isClearable}
      placeholder={placeholder}
      className="react-select-container"
      classNamePrefix="react-select"
      noOptionsMessage={() => "Nenhum resultado encontrado"}
      styles={{
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--input))",
          backgroundColor: "hsl(var(--card))",
          borderRadius: "0.375rem",
          minHeight: "2.25rem",
          height: "2.25rem",
          boxShadow: "none",
          "&:hover": { borderColor: "hsl(var(--border))" },
        }),
        valueContainer: (base) => ({
          ...base,
          height: "2.25rem",
          padding: "0 0.5rem",
        }),
        input: (base) => ({
          ...base,
          margin: "0",
          padding: "0",
          fontSize: "0.875rem",
          color: "hsl(var(--foreground))",
        }),
        indicatorsContainer: (base) => ({
          ...base,
          height: "2.25rem",
        }),
        dropdownIndicator: (base) => ({
          ...base,
          padding: "0 0.5rem",
          color: "hsl(var(--muted-foreground))",
        }),
        clearIndicator: (base) => ({
          ...base,
          padding: "0 0.5rem",
          color: "hsl(var(--muted-foreground))",
        }),
        singleValue: (base) => ({
          ...base,
          fontSize: "0.875rem",
          color: "hsl(var(--foreground))",
        }),
        placeholder: (base) => ({
          ...base,
          fontSize: "0.875rem",
          color: "hsl(var(--muted-foreground))",
        }),
        menu: (base) => ({
          ...base,
          borderRadius: "0.375rem",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)",
          overflow: "hidden",
          zIndex: 9999,
          backgroundColor: "hsl(var(--popover))",
          border: "1px solid hsl(var(--border))",
        }),
        menuList: (base) => ({
          ...base,
          backgroundColor: "hsl(var(--popover))",
          padding: "4px",
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "var(--brand-blue, #2563eb)"
            : state.isFocused
            ? "hsl(var(--accent))"
            : "transparent",
          color: state.isSelected
            ? "#ffffff"
            : state.isFocused
            ? "hsl(var(--accent-foreground))"
            : "hsl(var(--popover-foreground))",
          cursor: "pointer",
          padding: "0.5rem 0.75rem",
          fontSize: "0.875rem",
          borderRadius: "0.25rem",
        }),
      }}
      {...rest}
    />
  )
}
