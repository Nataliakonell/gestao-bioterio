using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.CreateMovimentacaoAnimal
{
    public class CreateMovimentacaoAnimalDto
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int LocalizacaoId { get; set; }
        public int? EventoId { get; set; }
        public TipoMovimentacao TipoMovimentacao { get; set; }
    }
}
