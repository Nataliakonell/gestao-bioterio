using MediatR;

namespace Gestao_Bioterio.Application.Features.Consultas.Command.DeleteConsulta
{
    public class DeleteConsultaCommand : IRequest
    {
        public int Id { get; set; }
    }
}
