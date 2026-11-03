using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Command.UpdateMedicacao
{
    public class UpdateMedicacaoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public string PrincipioAtivo { get; set; } = string.Empty;
        public string NomeComercial { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}