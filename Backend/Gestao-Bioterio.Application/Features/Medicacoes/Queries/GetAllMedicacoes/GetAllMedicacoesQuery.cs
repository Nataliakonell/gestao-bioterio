using MediatR;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Queries.GetAllMedicacoes
{
    public class GetAllMedicacoesQuery : IRequest<List<MedicacaoListVm>>
    {
    }
}