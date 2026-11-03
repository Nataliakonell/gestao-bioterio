using MediatR;

namespace Gestao_Bioterio.Application.Features.Especies.Command.DeleteEspecie
{
    public class DeleteEspecieCommand : IRequest
    {
        public int Id { get; set; }
    }
}
