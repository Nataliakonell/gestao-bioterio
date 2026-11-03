using MediatR;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.CreateAnimalLocalizacao
{
    public class CreateAnimalLocalizacaoCommand : IRequest<CreateAnimalLocalizacaoResponse>
    {
        public int AnimalId { get; set; }
        public int LocalizacaoId { get; set; }
    }
}
