import React from 'react';
import { StatusProtocolo } from '@/services/ProtocoloDesverminacaoService';

interface DesverminacaoStatusBadgeProps {
    status: StatusProtocolo | string;
}

export function DesverminacaoStatusBadge({ status }: DesverminacaoStatusBadgeProps) {
    let label = String(status);
    let colorClass = "bg-gray-100 text-gray-800 border-gray-200";

    if (typeof status === 'string') {
        if (status === "AguardandoPrimeiraDose" || status === "Aguardando 1ª dose") {
            label = "Aguardando 1ª dose";
            colorClass = "bg-amber-100 text-amber-800 border-amber-200";
        } else if (status === "AguardandoSegundaDose" || status === "Aguardando 2ª dose") {
            label = "Aguardando 2ª dose";
            colorClass = "bg-blue-100 text-blue-800 border-blue-200";
        } else if (status === "ManutencaoAnual" || status === "Manutenção Anual") {
            label = "Manutenção Anual";
            colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
        } else if (status === "Atrasado" || status === "Atrasada") {
            label = "Atrasado";
            colorClass = "bg-red-100 text-red-800 border-red-200";
        } else if (status === "Concluido" || status === "Concluído") {
            label = "Concluído";
            colorClass = "bg-green-100 text-green-800 border-green-200";
        } else if (status === "Suspenso") {
            label = "Suspenso";
            colorClass = "bg-gray-100 text-gray-600 border-gray-200";
        } else if (status === "Hoje") {
            label = "Iniciar hoje";
            colorClass = "bg-purple-100 text-purple-800 border-purple-200";
        }
    }

    return (
        <span className={`inline-flex items-center justify-center text-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap leading-normal border ${colorClass}`}>
            {label}
        </span>
    );
}
