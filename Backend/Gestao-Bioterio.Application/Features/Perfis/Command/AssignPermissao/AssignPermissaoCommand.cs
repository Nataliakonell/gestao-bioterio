using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.AssignPermissao
{
    public class AssignPermissaoCommand : IRequest<BaseResponse>
    {
        public int PerfilId { get; set; }
        public int FuncionalidadeId { get; set; }
        public NivelAcesso NivelAcesso { get; set; }
    }
}
