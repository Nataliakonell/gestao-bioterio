import { Tag } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"

interface ConfirmarProtocoloDesverminacaoModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    animalLabel?: string
}

export function ConfirmarProtocoloDesverminacaoModal({
    isOpen,
    onClose,
    onConfirm,
    animalLabel,
}: ConfirmarProtocoloDesverminacaoModalProps) {
    return (
        <ModalShell
            isOpen={isOpen}
            onClose={onClose}
            title="Iniciar protocolo de desverminação?"
            icon={<Tag className="h-4 w-4" />}
            iconBg="teal"
            size="sm"
            footerProps={{
                onCancel: onClose,
                cancelLabel: "Não, obrigado",
                onSave: onConfirm,
                saveLabel: "Sim, iniciar",
            }}
        >
            <div className="space-y-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                    O animal foi cadastrado com sucesso.
                    {animalLabel ? (
                        <span className="font-medium text-gray-900"> {animalLabel}</span>
                    ) : null}{" "}
                    Deseja iniciar o protocolo de desverminação agora?
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Ao continuar, você será direcionado para o cadastro da dose de desverminação deste animal.
                </p>
            </div>
        </ModalShell>
    )
}
