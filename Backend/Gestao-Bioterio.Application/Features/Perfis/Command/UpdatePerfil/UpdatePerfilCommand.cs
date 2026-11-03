using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.UpdatePerfil
{
    public class UpdatePerfilCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Descricao { get; set; }
    }
}
