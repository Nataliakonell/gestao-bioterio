using MediatR;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Queries.GetMedicacaoLookup
{
    public class MedicacaoLookupVm
    {
        public int Id { get; set; }
        public string PrincipioAtivo { get; set; } = string.Empty;
        public string NomeComercial { get; set; } = string.Empty;
    }

    public class GetMedicacaoLookupQuery : IRequest<List<MedicacaoLookupVm>> { }
}