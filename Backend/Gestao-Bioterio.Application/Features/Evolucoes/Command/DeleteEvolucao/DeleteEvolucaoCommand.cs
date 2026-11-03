using MediatR;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Command.DeleteEvolucao
{
    public class DeleteEvolucaoCommand : IRequest
    {
        public int Id { get; set; }
    }
}