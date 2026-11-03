import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { openInNewTab } from "@/lib/utils"

interface AddButtonProps {
  className?: string
  text?: string
  route?: string
  state?: any
  newTab?: boolean
  onClick?: () => void
}

export function AddButton({ className, text = "Cadastrar animal", route = "/plantel/cadastro", state, newTab, onClick }: AddButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (newTab) {
      openInNewTab(route)
    } else {
      navigate(route, { state })
    }
  }

  return (
    <Button
      onClick={handleClick}
      className={`gap-2 bg-brand hover:brightness-95 ${className}`}
    >
      <Plus className="h-4 w-4" />
      {text}
    </Button>
  )
}
