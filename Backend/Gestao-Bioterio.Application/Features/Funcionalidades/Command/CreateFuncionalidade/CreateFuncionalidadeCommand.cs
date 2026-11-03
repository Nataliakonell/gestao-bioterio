using MediatR;

namespace Gestao_Bioterio.Application.Features.Funcionalidade.Command.CreateFuncionalidade
{
    public class CreateFuncionalidadeCommand : IRequest<CreateFuncionalidadeResponse>
    {
        public string Nome { get; set; }
        public string Descricao { get; set; }
    }
}
