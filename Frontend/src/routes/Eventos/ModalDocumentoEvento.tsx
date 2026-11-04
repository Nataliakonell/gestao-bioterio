import React, { useState, useEffect } from "react"
import { DocumentViewerModalShell } from "@/components/DocumentoViewer/DocumentViewerModalShell"
import { DocumentoViewer } from "@/components/DocumentoViewer"
import { TipoDocumento, modeloDocumentoService, type ModeloDocumentoVm } from "@/services/ModeloDocumentoService"
import { documentoEventoService, type DocumentoEventoListVm } from "@/services/DocumentoEventoService"
import { FileText, ExternalLink, AlertCircle } from "lucide-react"
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

  const acoes = onEditarFormulario ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onEditarFormulario}
      className="rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 border-gray-200"
    >
      <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
      Editar Formulário
    </Button>
  ) : undefined

  return (
    <DocumentViewerModalShell
      isOpen={isOpen}
      onClose={onClose}
      titulo={eventoNome ? `Documento: ${eventoNome}` : "Documento: Autorização e Transporte de Fauna (IMASUL)"}
      subtitulo={
        docEvento
          ? `Resp: ${docEvento.rf} • Modelo: ${modeloDoc?.nome || "Formulário de Transporte de Fauna"}`
          : "Transporte oficial de animais silvestres"
      }
      icon={<FileText className="h-5 w-5" />}
      acoes={acoes}
      loading={loading}
    >
      {!docEvento || !dadosDocumento ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-gray-100 space-y-3">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-800 text-base">Nenhum documento oficial gerado para este evento</h3>
            <p className="text-sm text-slate-600 mt-1">
              Documentos de transporte de fauna são gerados automaticamente para eventos com destino externo.
            </p>
          </div>
          {onEditarFormulario && (
            <Button onClick={onEditarFormulario} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 mt-2">
              <ExternalLink className="h-4 w-4" />
              Preencher Formulário de Saída
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <DocumentoViewer
            tipoDocumento={TipoDocumento.DocumentoDeEventoExterno}
            dados={dadosDocumento}
            customTemplate={modeloDoc?.conteudo}
          />
        </div>
      )}
    </DocumentViewerModalShell>
  )
}
