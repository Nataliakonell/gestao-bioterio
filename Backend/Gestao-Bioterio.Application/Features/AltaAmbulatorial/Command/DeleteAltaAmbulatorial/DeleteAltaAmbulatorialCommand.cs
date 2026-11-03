using MediatR;

namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.DeleteAltaAmbulatorial
{
    public class DeleteAltaAmbulatorialCommand : IRequest
    {
        public int Id { get; set; }
    }
}
