using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Application.Features.Perfis.Command.CreatePerfil;

namespace Gestao_Bioterio.Application.Features.Funcionalidade.Command.CreateFuncionalidade
{
    public class CreateFuncionalidadeResponse : BaseResponse
    {
        public CreateFuncionalidadeResponse() : base() 
        {
        }
        public int Id { get; set; }
        public CreateFuncionalidadeDto? Funcionalidade { get; set; }
    }
}
