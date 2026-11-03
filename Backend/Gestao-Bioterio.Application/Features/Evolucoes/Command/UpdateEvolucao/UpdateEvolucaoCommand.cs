using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Command.UpdateEvolucao
{
    public class UpdateEvolucaoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public DateTime DataHoraRegistro { get; set; }
        public string Responsavel { get; set; } = string.Empty;
    }
}