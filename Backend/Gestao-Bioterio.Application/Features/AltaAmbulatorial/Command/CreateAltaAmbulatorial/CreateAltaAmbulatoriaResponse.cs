using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.CreateAltaAmbulatorial
{
    public class CreateAltaAmbulatoriaResponse : BaseResponse
    {
        public int Id { get; set; }
        public CreateAltaAmbulatoriaDto? AltaAmbulatorial { get; set; }
    }
}
