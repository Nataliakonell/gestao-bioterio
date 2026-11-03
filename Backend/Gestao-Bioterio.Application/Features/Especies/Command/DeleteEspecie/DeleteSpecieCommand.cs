using MediatR;

namespace gestao_bioterio.Application.Features.Species.Command.DeleteSpecie
{
    public class DeleteSpecieCommand : IRequest
    {
        public int Id { get; set; }
    }
}