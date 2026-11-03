using MediatR;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Command.CreateEvolucao
{
    public class CreateEvolucaoCommand : IRequest<CreateEvolucaoResponse>
    {
        public int AnimalId { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public DateTime DataHoraRegistro { get; set; }
        public string Responsavel { get; set; } = string.Empty;
    }
}