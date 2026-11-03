using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.CreateMovimentacaoAnimal
{
    public class CreateMovimentacaoAnimalCommand : IRequest<CreateMovimentacaoAnimalResponse>
    {
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
