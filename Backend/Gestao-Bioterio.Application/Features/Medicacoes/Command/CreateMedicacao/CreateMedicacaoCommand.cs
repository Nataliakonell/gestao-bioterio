using MediatR;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Command.CreateMedicacao
{
    public class CreateMedicacaoCommand : IRequest<CreateMedicacaoResponse>
    {
        public string PrincipioAtivo { get; set; } = string.Empty;
        public string NomeComercial { get; set; } = string.Empty;
    }
}