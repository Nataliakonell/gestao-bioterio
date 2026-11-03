using MediatR;

namespace Gestao_Bioterio.Application.Features.Grupos.Queries.GetGrupoLookup
{
    public class GrupoLookupVm
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
    }

    public class GetGrupoLookupQuery : IRequest<List<GrupoLookupVm>> { }
}
