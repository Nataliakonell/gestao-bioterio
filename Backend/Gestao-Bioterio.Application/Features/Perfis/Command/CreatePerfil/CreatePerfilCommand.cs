using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.CreatePerfil
{
    public class CreatePerfilCommand : IRequest<CreatePerfilResponse>
    {
        public string Nome { get; set; }
        public string Descricao { get; set; }
    }
}
