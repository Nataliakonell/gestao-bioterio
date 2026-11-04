import { useEffect, useState } from 'react';
import { 
  Book, 
  Rat, 
  Stethoscope, 
  Building2, 
  CalendarDays, 
  ArrowLeftRight, 
  FileText, 
  FileSpreadsheet, 
  Download,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import HeaderGeral from '@/components/header-geral';
import { HeaderContainer } from '@/components/header-container';
import { PageContainer } from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { FormLayoutBase } from '@/components/formulario-registro/CadastroRegistroForm';
import { relatorioService } from '@/services/relatorioService';
import type { FormatoRelatorio } from '@/services/relatorioService';
import { especieService, type EspecieLookupVm } from '@/services/EspecieService';
import { grupoService, type GrupoLookupVm } from '@/services/GrupoService';
import { localizacaoService, type LocalizacaoListVm } from '@/services/LocalizacaoService';
import { animalService, type AnimalLookupVm } from '@/services/animalService';

import { FiltrosPlantel, type PlantelFiltrosState } from './FiltrosPlantel';
import { FiltrosAlimentacao, type AlimentacaoFiltrosState } from './FiltrosAlimentacao';
import { FiltrosClinico, type ClinicoFiltrosState } from './FiltrosClinico';
import { FiltrosInstalacoes, type InstalacoesFiltrosState } from './FiltrosInstalacoes';
import { FiltrosEventos, type EventosFiltrosState } from './FiltrosEventos';
import { FiltrosMovimentacoes, type MovimentacoesFiltrosState } from './FiltrosMovimentacoes';
import { FiltrosSisfauna, type SisfaunaFiltrosState } from './FiltrosSisfauna';

type TabAssunto = 'plantel' | 'alimentacao' | 'clinico' | 'instalacoes' | 'eventos' | 'movimentacoes' | 'sisfauna';

export default function VisaoGeralRelatorios() {
  const [activeTab, setActiveTab] = useState<TabAssunto>('plantel');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Dados auxiliares para selects
  const [especies, setEspecies] = useState<EspecieLookupVm[]>([]);
  const [grupos, setGrupos] = useState<GrupoLookupVm[]>([]);
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoListVm[]>([]);
  const [animaisLookup, setAnimaisLookup] = useState<AnimalLookupVm[]>([]);

  // Estados dos filtros de cada aba
  const [plantelFiltros, setPlantelFiltros] = useState<PlantelFiltrosState>({
    grupoId: '',
    especieId: '',
    situacao: '',
    genero: '',
    faseDeVida: '',
    dataEntradaInicio: '',
    dataEntradaFim: ''
  });

  const [alimentacaoFiltros, setAlimentacaoFiltros] = useState<AlimentacaoFiltrosState>({
    dataInicio: '',
    dataFim: '',
    especieId: '',
    consumo: '',
    responsavel: ''
  });

  const [clinicoFiltros, setClinicoFiltros] = useState<ClinicoFiltrosState>({
    dataInicio: '',
    dataFim: '',
    tipoClinico: '',
    animalId: '',
    veterinario: ''
  });

  const [instalacoesFiltros, setInstalacoesFiltros] = useState<InstalacoesFiltrosState>({
    localizacaoId: '',
    incluirSublocais: true,
    especieId: ''
  });

  const [eventosFiltros, setEventosFiltros] = useState<EventosFiltrosState>({
    dataInicio: '',
    dataFim: '',
    tipoEvento: '',
    status: ''
  });

  const [movimentacoesFiltros, setMovimentacoesFiltros] = useState<MovimentacoesFiltrosState>({
    dataInicio: '',
    dataFim: '',
    animalId: '',
    tipoMovimentacao: '',
    localizacaoId: ''
  });

  const [sisfaunaFiltros, setSisfaunaFiltros] = useState<SisfaunaFiltrosState>({
    anoReferencia: new Date().getFullYear().toString(),
    dataEntradaInicio: '',
    dataEntradaFim: '',
    especieId: '',
    somenteAtivos: false
  });

  useEffect(() => {
    carregarAuxiliares();
  }, []);

  const carregarAuxiliares = async () => {
    try {
      const [espData, grpData, locData, anData] = await Promise.all([
        especieService.getLookup().catch((err) => {
          console.error('Erro ao buscar especies:', err);
          return [];
        }),
        grupoService.getLookup().catch((err) => {
          console.error('Erro ao buscar grupos:', err);
          return [];
        }),
        localizacaoService.getAll().catch((err) => {
          console.error('Erro ao buscar localizacoes:', err);
          return [];
        }),
        animalService.getLookup().catch((err) => {
          console.error('Erro ao buscar lookup animais:', err);
          return [];
        })
      ]);

      setEspecies(espData || []);
      setGrupos(grpData || []);
      setLocalizacoes(locData || []);
      setAnimaisLookup(anData || []);
    } catch (e) {
      console.error('Erro geral carregando auxiliares de relatorios', e);
    }
  };

  const handleExportar = async (formato: FormatoRelatorio) => {
    const actionKey = `${activeTab}-${formato}`;
    setLoadingAction(actionKey);

    try {
      switch (activeTab) {
        case 'plantel':
          await relatorioService.exportarPlantel({
            formato,
            grupoId: plantelFiltros.grupoId ? Number(plantelFiltros.grupoId) : undefined,
            especieId: plantelFiltros.especieId ? Number(plantelFiltros.especieId) : undefined,
            situacao: plantelFiltros.situacao ? Number(plantelFiltros.situacao) : undefined,
            genero: plantelFiltros.genero ? Number(plantelFiltros.genero) : undefined,
            faseDeVida: plantelFiltros.faseDeVida ? Number(plantelFiltros.faseDeVida) : undefined,
            dataEntradaInicio: plantelFiltros.dataEntradaInicio || undefined,
            dataEntradaFim: plantelFiltros.dataEntradaFim || undefined
          });
          break;

        case 'alimentacao':
          await relatorioService.exportarAlimentacao({
            formato,
            dataInicio: alimentacaoFiltros.dataInicio || undefined,
            dataFim: alimentacaoFiltros.dataFim || undefined,
            especieId: alimentacaoFiltros.especieId ? Number(alimentacaoFiltros.especieId) : undefined,
            consumo: alimentacaoFiltros.consumo ? Number(alimentacaoFiltros.consumo) : undefined,
            responsavel: alimentacaoFiltros.responsavel || undefined
          });
          break;

        case 'clinico':
          await relatorioService.exportarClinico({
            formato,
            dataInicio: clinicoFiltros.dataInicio || undefined,
            dataFim: clinicoFiltros.dataFim || undefined,
            tipoClinico: clinicoFiltros.tipoClinico ? Number(clinicoFiltros.tipoClinico) : undefined,
            animalId: clinicoFiltros.animalId ? Number(clinicoFiltros.animalId) : undefined,
            veterinario: clinicoFiltros.veterinario || undefined
          });
          break;

        case 'instalacoes':
          if (!instalacoesFiltros.localizacaoId) {
            toast.error('Selecione uma localização/sala para emitir o relatório.');
            setLoadingAction(null);
            return;
          }
          await relatorioService.exportarInstalacoes({
            formato,
            localizacaoId: Number(instalacoesFiltros.localizacaoId),
            incluirSublocais: instalacoesFiltros.incluirSublocais,
            especieId: instalacoesFiltros.especieId ? Number(instalacoesFiltros.especieId) : undefined
          });
          break;

        case 'eventos':
          await relatorioService.exportarEventos({
            formato,
            dataInicio: eventosFiltros.dataInicio || undefined,
            dataFim: eventosFiltros.dataFim || undefined,
            tipoEvento: eventosFiltros.tipoEvento ? Number(eventosFiltros.tipoEvento) : undefined,
            status: eventosFiltros.status ? Number(eventosFiltros.status) : undefined
          });
          break;

        case 'movimentacoes':
          await relatorioService.exportarMovimentacoes({
            formato,
            dataInicio: movimentacoesFiltros.dataInicio || undefined,
            dataFim: movimentacoesFiltros.dataFim || undefined,
            animalId: movimentacoesFiltros.animalId ? Number(movimentacoesFiltros.animalId) : undefined,
            tipoMovimentacao: movimentacoesFiltros.tipoMovimentacao ? Number(movimentacoesFiltros.tipoMovimentacao) : undefined,
            localizacaoId: movimentacoesFiltros.localizacaoId ? Number(movimentacoesFiltros.localizacaoId) : undefined
          });
          break;

        case 'sisfauna':
          await relatorioService.exportarSisfauna({
            formato,
            anoReferencia: sisfaunaFiltros.anoReferencia ? Number(sisfaunaFiltros.anoReferencia) : undefined,
            dataEntradaInicio: sisfaunaFiltros.dataEntradaInicio || undefined,
            dataEntradaFim: sisfaunaFiltros.dataEntradaFim || undefined,
            especieId: sisfaunaFiltros.especieId ? Number(sisfaunaFiltros.especieId) : undefined,
            somenteAtivos: sisfaunaFiltros.somenteAtivos
          });
          break;
      }

      toast.success(`Relatório em ${formato} gerado com sucesso!`);
    } catch {
      toast.error('Erro ao gerar relatório. Verifique os filtros e tente novamente.');
    } finally {
      setLoadingAction(null);
    }
  };

  const tabsConfig = [
    { id: 'plantel', label: 'Plantel', icon: Book },
    { id: 'alimentacao', label: 'Alimentação', icon: Rat },
    { id: 'clinico', label: 'Clínico', icon: Stethoscope },
    { id: 'instalacoes', label: 'Instalações', icon: Building2 },
    { id: 'eventos', label: 'Eventos', icon: CalendarDays },
    { id: 'movimentacoes', label: 'Movimentações', icon: ArrowLeftRight },
    { id: 'sisfauna', label: 'SISFAUNA', icon: FileText }
  ];

  const tabAtualInfo = tabsConfig.find((t) => t.id === activeTab);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              title="Relatórios"
              breadcrumbTitle="Relatórios"
              breadcrumbUrl="/relatorios"
            />
          </HeaderContainer>

          <div className="flex flex-col gap-6">
            {/* Navegação de Abas do Módulo de Relatórios */}
            <div className="border-b border-border">
              <nav className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none" aria-label="Tabs">
                {tabsConfig.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabAssunto)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Formulário com FormLayoutBase e componentes padrão */}
            <FormLayoutBase
              titleFirstSection={`Filtros para Relatório de ${tabAtualInfo?.label}`}
              columnsClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              submitLabel="Exportar Excel"
              onSubmit={async () => {
                await handleExportar('Excel');
                return false;
              }}
              onCancel={() => {
                toast.info('Filtros mantidos.');
              }}
              checkIsDirty={() => false}
              hideSubmit={true}
              hideCancel={true}
            >
              {activeTab === 'plantel' && (
                <FiltrosPlantel
                  filtros={plantelFiltros}
                  onChange={setPlantelFiltros}
                  grupos={grupos}
                  especies={especies}
                />
              )}

              {activeTab === 'alimentacao' && (
                <FiltrosAlimentacao
                  filtros={alimentacaoFiltros}
                  onChange={setAlimentacaoFiltros}
                  especies={especies}
                />
              )}

              {activeTab === 'clinico' && (
                <FiltrosClinico
                  filtros={clinicoFiltros}
                  onChange={setClinicoFiltros}
                  animaisLookup={animaisLookup}
                />
              )}

              {activeTab === 'instalacoes' && (
                <FiltrosInstalacoes
                  filtros={instalacoesFiltros}
                  onChange={setInstalacoesFiltros}
                  localizacoes={localizacoes}
                  especies={especies}
                />
              )}

              {activeTab === 'eventos' && (
                <FiltrosEventos
                  filtros={eventosFiltros}
                  onChange={setEventosFiltros}
                />
              )}

              {activeTab === 'movimentacoes' && (
                <FiltrosMovimentacoes
                  filtros={movimentacoesFiltros}
                  onChange={setMovimentacoesFiltros}
                  animaisLookup={animaisLookup}
                  localizacoes={localizacoes}
                />
              )}

              {activeTab === 'sisfauna' && (
                <FiltrosSisfauna
                  filtros={sisfaunaFiltros}
                  onChange={setSisfaunaFiltros}
                  especies={especies}
                />
              )}
            </FormLayoutBase>

            <div className="flex justify-end items-center gap-3 -mt-4">
              <Button
                variant="outline"
                onClick={() => handleExportar('Excel')}
                disabled={loadingAction !== null}
                className="gap-4 border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              >
                {loadingAction === `${activeTab}-Excel` ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                )}
                Exportar Excel (.xlsx)
              </Button>

              <Button
                onClick={() => handleExportar('Pdf')}
                disabled={loadingAction !== null}
                className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {loadingAction === `${activeTab}-Pdf` ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Exportar PDF (.pdf)
              </Button>
            </div>
          </div>
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  );
}
