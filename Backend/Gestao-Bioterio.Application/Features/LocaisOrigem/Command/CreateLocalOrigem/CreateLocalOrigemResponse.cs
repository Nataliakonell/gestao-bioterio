using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Command.CreateLocalOrigem
{
    public class CreateLocalOrigemResponse : BaseResponse
    {
        public CreateLocalOrigemResponse() : base()
        {
        }
        public CreateLocalOrigemDto LocalOrigem { get; set; } = default!;
        public int Id { get; set; }
    }
}
