using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Animais.Queries.GetAllAnimals
{
    public class GetAllAnimalsQuery : IRequest<PaginatedAnimalListVm>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public Situacao? SituacaoAnimal { get; set; }
        public int? EspecieId { get; set; }
        public int? InstalacaoBioterioId { get; set; }
        public Genero? Genero { get; set; }
        public string? NumeroRegistro { get; set; }
        public List<int>? FaseDeVida { get; set; }
    }
}
