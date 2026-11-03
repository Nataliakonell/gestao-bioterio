using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Command.UpdateRegistroObito
{
    public class UpdateRegistroObitoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public DateTime DataObito { get; set; }
        public bool HouveNecropsia { get; set; }
        public string? Observacoes { get; set; }
    }
}
