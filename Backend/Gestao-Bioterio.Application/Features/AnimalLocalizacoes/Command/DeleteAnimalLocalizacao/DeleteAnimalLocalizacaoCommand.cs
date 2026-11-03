using MediatR;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.DeleteAnimalLocalizacao
{
    public class DeleteAnimalLocalizacaoCommand : IRequest
    {
        public int Id { get; set; }
    }
}
