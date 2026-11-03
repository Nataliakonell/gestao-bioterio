using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.UpdateAnimalLocalizacao
{
    public class UpdateAnimalLocalizacaoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int LocalizacaoId { get; set; }
    }
}
