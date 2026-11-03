using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Consultas.Command.CreateConsulta
{
    public class CreateConsultaResponse : BaseResponse
    {
        public int Id { get; set; }
        public CreateConsultaDto? Consulta { get; set; }
    }
}
