using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Command.CreateEvolucao
{
    public class CreateEvolucaoResponse : BaseResponse
    {
        public CreateEvolucaoResponse() : base()
        {
        }
        public int Id { get; set; }
        public CreateEvolucaoDto? Evolucao { get; set; }
    }
}