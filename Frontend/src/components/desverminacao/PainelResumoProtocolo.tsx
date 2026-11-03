import React from 'react';
import { AlertCircle } from 'lucide-react';
import { TimelineDoses, type TimelineDoseItem } from '@/components/clinico/TimelineDoses';

export interface PainelResumoProtocoloProps {
    dataEntrada: string | null;
    statusCiclo: 'nao_iniciado' | 'ja_fez_doses';
    dataUltimaDoseInformada: string | null;
    tipoUltimaDoseInformada: string | null; // 1 = 1ª dose, 2 = 2ª dose, 3 = Anual
}

export function PainelResumoProtocolo({
    dataEntrada,
    statusCiclo,
    dataUltimaDoseInformada,
    tipoUltimaDoseInformada
}: PainelResumoProtocoloProps) {
    
    const parseLocalDate = (dateStr: string | null | undefined): Date | null => {
        if (!dateStr) return null;
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const [, year, month, day] = match;
            return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), 12, 0, 0);
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        d.setHours(12, 0, 0, 0);
        return d;
    };

    const formatDate = (dateIso: string | null | undefined) => {
        if (!dateIso) return '—';
        const match = dateIso.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const [, year, month, day] = match;
            return `${day}/${month}/${year}`;
        }
        const dt = parseLocalDate(dateIso);
        if (!dt) return '—';
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
    };

    const addDaysSafe = (baseDateStr: string, days: number): string => {
        const dt = parseLocalDate(baseDateStr);
        if (!dt) return '';
        dt.setDate(dt.getDate() + days);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T12:00:00`;
    };

    let prev1aDose: string | null = null;
    let prev2aDose: string | null = null;
    let prevAnual: string | null = null;

    let statEntrada: 'concluido' = 'concluido';
    let stat1aDose: 'concluido' | 'pendente' | 'atrasado' | 'atual' = 'pendente';
    let stat2aDose: 'concluido' | 'pendente' | 'atrasado' | 'atual' = 'pendente';
    let statAnual: 'concluido' | 'pendente' | 'atrasado' | 'atual' = 'pendente';

    if (dataEntrada) {
        if (statusCiclo === 'nao_iniciado') {
            prev1aDose = addDaysSafe(dataEntrada, 60);
            prev2aDose = addDaysSafe(prev1aDose, 15);
            prevAnual = addDaysSafe(prev2aDose, 365);
            stat1aDose = 'atual';

        } else if (statusCiclo === 'ja_fez_doses' && dataUltimaDoseInformada) {
            if (tipoUltimaDoseInformada === "1") {
                stat1aDose = 'concluido';
                prev1aDose = dataUltimaDoseInformada;

                prev2aDose = addDaysSafe(dataUltimaDoseInformada, 15);
                stat2aDose = 'atual';

                prevAnual = addDaysSafe(prev2aDose, 365);

            } else if (tipoUltimaDoseInformada === "2") {
                stat1aDose = 'concluido';
                stat2aDose = 'concluido';
                prev2aDose = dataUltimaDoseInformada;

                prevAnual = addDaysSafe(dataUltimaDoseInformada, 365);
                statAnual = 'atual';

            } else if (tipoUltimaDoseInformada === "3") {
                stat1aDose = 'concluido';
                stat2aDose = 'concluido';
                prevAnual = addDaysSafe(dataUltimaDoseInformada, 365);
                statAnual = 'atual';
            }
        }
    }

    const timelineItems: TimelineDoseItem[] = [
        {
            stepNumber: 1,
            dateText: `Entrada: ${formatDate(dataEntrada)}`,
            badgeText: 'Entrada no Biotério',
            isCompleted: statEntrada === 'concluido',
            isActive: statEntrada === 'atual',
            isOverdue: statEntrada === 'atrasado'
        },
        {
            stepNumber: 2,
            dateText: `1ª Dose: ${formatDate(prev1aDose)}`,
            badgeText: 'Aos 60 dias',
            isCompleted: stat1aDose === 'concluido',
            isActive: stat1aDose === 'atual',
            isOverdue: stat1aDose === 'atrasado'
        },
        {
            stepNumber: 3,
            dateText: `2ª Dose: ${formatDate(prev2aDose)}`,
            badgeText: '+15 dias após',
            isCompleted: stat2aDose === 'concluido',
            isActive: stat2aDose === 'atual',
            isOverdue: stat2aDose === 'atrasado'
        },
        {
            stepNumber: 4,
            dateText: `Manutenção: ${formatDate(prevAnual)}`,
            badgeText: 'Anual',
            isCompleted: statAnual === 'concluido',
            isActive: statAnual === 'atual',
            isOverdue: statAnual === 'atrasado'
        }
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-6 border-b pb-3">Resumo do Ciclo de Desverminação</h3>
            
            <TimelineDoses items={timelineItems} />
            
            <div className="mt-6 bg-blue-50 text-blue-800 text-xs p-3 rounded border border-blue-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <p>
                    O sistema calcula automaticamente as previsões com base na data de entrada ou na última dose reportada, de acordo com o <strong>Protocolo Técnico de Referência</strong>.
                </p>
            </div>
        </div>
    );
}
