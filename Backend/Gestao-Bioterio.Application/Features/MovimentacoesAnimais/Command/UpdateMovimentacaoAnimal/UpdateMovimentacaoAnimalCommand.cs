using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.UpdateMovimentacaoAnimal
{
    public class UpdateMovimentacaoAnimalCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int LocalizacaoId { get; set; }

        public int LocalizacaoDestinoId
        {
            get => LocalizacaoId;
            set => LocalizacaoId = value;
        }

        public int? EventoId { get; set; }
        public TipoMovimentacao TipoMovimentacao { get; set; } = TipoMovimentacao.Transferencia;
    }
}
