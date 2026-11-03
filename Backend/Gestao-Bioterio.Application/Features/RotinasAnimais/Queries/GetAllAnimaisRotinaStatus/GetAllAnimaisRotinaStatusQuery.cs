using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllAnimaisRotinaStatus
{
    public class GetAllAnimaisRotinaStatusQuery : IRequest<PaginatedAnimalRotinaStatusVm>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public Situacao? SituacaoAnimal { get; set; } = Situacao.Vivo;
        public int? EspecieId { get; set; }
        
        public string? Search { get; set; }
        public List<int>? FaseDeVida { get; set; }
        
        public List<int>? StatusBiometria { get; set; }
        public DateTime? DataBiometriaInicial { get; set; }
        public DateTime? DataBiometriaFinal { get; set; }
        
        public List<int>? StatusAlimentacao { get; set; }
        public DateTime? DataAlimentacaoInicial { get; set; }
        public DateTime? DataAlimentacaoFinal { get; set; }
    }
}
