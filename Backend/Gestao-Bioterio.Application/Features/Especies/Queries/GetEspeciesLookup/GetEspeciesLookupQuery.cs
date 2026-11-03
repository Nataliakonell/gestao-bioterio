using MediatR;

namespace Gestao_Bioterio.Application.Features.Especies.Queries.GetEspeciesLookup
{
    public class GetEspeciesLookupQuery : IRequest<List<EspecieLookupVm>> { }
}
