import React, { useState, useEffect } from "react"
import { ModalShell } from "@/components/ui/modal-shell"
import { DocumentoViewer } from "@/components/DocumentoViewer"
import { TipoDocumento, modeloDocumentoService, type ModeloDocumentoVm } from "@/services/ModeloDocumentoService"
import { documentoEventoService, type DocumentoEventoListVm } from "@/services/DocumentoEventoService"
import { FileText, Loader2, Edit3, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModalDocumentoEventoProps {
  isOpen: boolean
  onClose: () => void
  eventoId: number | null
  eventoNome?: string
  onEditarFormulario?: () => void
}

export function ModalDocumentoEvento({
  isOpen,
  onClose,
  eventoId,
  eventoNome,
  onEditarFormulario,
}: ModalDocumentoEventoProps) {
  const [loading, setLoading] = useState(false)
  const [docEvento, setDocEvento] = useState<DocumentoEventoListVm | null>(null)
  const [dadosDocumento, setDadosDocumento] = useState<Record<string, any> | null>(null)
  const [modeloDoc, setModeloDoc] = useState<ModeloDocumentoVm | null>(null)

  useEffect(() => {
    if (!isOpen || !eventoId) {
      setDocEvento(null)
      setDadosDocumento(null)
      setModeloDoc(null)
      return
    }

    setLoading(true)
    Promise.all([
      documentoEventoService.getAll(eventoId),
      modeloDocumentoService.getAll().catch(() => []),
    ])
      .then(([docs, modelos]) => {
        if (docs && docs.length > 0) {
          const doc = docs[0]
          setDocEvento(doc)
          try {
            const parsed = JSON.parse(doc.conteudoDadosJson || "{}")
            setDadosDocumento(parsed)
          } catch (e) {
            console.error("Erro ao fazer parse dos dados do documento:", e)
            setDadosDocumento({})
          }

          if (modelos && modelos.length > 0) {
            const m =
              modelos.find((item) => item.id === doc.modeloDocumentoId) ||
              modelos.find(
                (item) => item.tipoDocumento === TipoDocumento.DocumentoDeEventoExterno
              ) ||
              modelos[0]
            setModeloDoc(m)
          }
        } else {
          setDocEvento(null)
          setDadosDocumento(null)
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar documento do evento:", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isOpen, eventoId])

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={eventoNome ? `Documento Oficial: ${eventoNome}` : "Documento de Transporte de Fauna (IMASUL)"}
      icon={<FileText className="h-5 w-5" />}
      iconBg="blue"
      size="xl"
    >
      <div className="p-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Carregando formulário e modelo oficial...</p>
          </div>
        ) : !docEvento || !dadosDocumento ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">Nenhum documento oficial gerado para este evento</h3>
              <p className="text-sm text-slate-600 mt-1">
                Documentos de transporte de fauna são emitidos automaticamente para eventos do tipo Externo (Fora da UCDB).
              </p>
            </div>
            {onEditarFormulario && (
              <Button onClick={onEditarFormulario} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Edit3 className="h-4 w-4" />
                Preencher Formulário de Saída
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200 p-3 rounded-lg">
              <div className="text-xs text-blue-900">
                <strong>Modelo Oficial IMASUL:</strong> {modeloDoc?.nome || "Formulário de Transporte de Fauna"}
                <span className="text-slate-500 ml-2">
                  (Criado em {new Date(docEvento.dataCriacao).toLocaleDateString("pt-BR")} por {docEvento.rf})
                </span>
              </div>
              {onEditarFormulario && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onEditarFormulario}
                  className="bg-white border-blue-300 text-blue-800 hover:bg-blue-100/50 gap-1.5 h-8 text-xs font-semibold"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Editar Dados
                </Button>
              )}
            </div>

            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white p-2">
              <DocumentoViewer
                tipoDocumento={TipoDocumento.DocumentoDeEventoExterno}
                dados={dadosDocumento}
                customTemplate={modeloDoc?.conteudo}
              />
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  )
}
