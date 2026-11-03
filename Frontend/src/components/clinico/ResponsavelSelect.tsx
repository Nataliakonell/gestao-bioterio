import { useEffect, useState, useMemo } from "react"
import { FormField } from "@/components/ui/form-field"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { getUsuariosLookup, type UsuarioLookupVm } from "@/services/UsuarioService"
import { getUserInfo } from "@/services/api"

interface ResponsavelSelectProps {
  value: string
  onChange: (nome: string) => void
  disabled?: boolean
  required?: boolean
  label?: string
  placeholder?: string
  className?: string
}

export function ResponsavelSelect({
  value,
  onChange,
  disabled = false,
  required = true,
  label = "Responsável",
  placeholder = "Selecione o responsável",
  className,
}: ResponsavelSelectProps) {
  const [usuarios, setUsuarios] = useState<UsuarioLookupVm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getUsuariosLookup()
      .then((data) => {
        if (!isMounted) return
        setUsuarios(data)
        // Se ainda não houver valor definido, define o usuário logado
        if (!value) {
          const currentUser = getUserInfo()
          if (currentUser?.name) {
            onChange(currentUser.name)
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const options = useMemo(() => {
    const list = usuarios.map((u) => ({
      value: u.nome,
      label: u.rf ? `${u.nome} (RF: ${u.rf})` : u.nome,
    }))

    // Se o valor já estiver preenchido (ex: edição de registro antigo) e não estiver na lista ativa
    if (value && value.trim() && !list.some((o) => o.value.toLowerCase() === value.trim().toLowerCase())) {
      list.unshift({ value: value.trim(), label: value.trim() })
    }

    return list
  }, [usuarios, value])

  return (
    <div className={className}>
      <FormField label={label} required={required}>
        <SearchableSelect
          options={options}
          value={value}
          onChange={onChange}
          placeholder={loading ? "Carregando responsáveis..." : placeholder}
          isDisabled={disabled || loading}
          isClearable={!required}
        />
      </FormField>
    </div>
  )
}
