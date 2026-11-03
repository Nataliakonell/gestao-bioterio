using MediatR;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Queries.GetLocalOrigemLookup
{
    public class LocalOrigemLookupVm
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
    }

    public class GetLocalOrigemLookupQuery : IRequest<List<LocalOrigemLookupVm>> { }
}
