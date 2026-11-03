using MediatR;

namespace Gestao_Bioterio.Application.Features.Anexos.Queries.GetAnexoDetail
{
    public class GetAnexoDetailQuery : IRequest<AnexoDetailVm>
    {
        public int Id { get; set; }
    }
}