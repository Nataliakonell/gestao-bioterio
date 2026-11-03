using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.CreateAltaAmbulatorial
{
    public class CreateAltaAmbulatoriaCommand : IRequest<CreateAltaAmbulatoriaResponse>
    {
        public int AnimalId { get; set; }
        public DateTime? DataEntradaAmbulatorio { get; set; }
        public DateTime? DataAltaClinica { get; set; }
        public string? ProcedimentosMedicacoes { get; set; }
        public string? ObservacoesClinicas { get; set; }
        public int? InstalacaoBioterioRetornoId { get; set; }
        public int? LocalizacaoDestinoId { get; set; }
        public string? Responsavel { get; set; }
    }
}
