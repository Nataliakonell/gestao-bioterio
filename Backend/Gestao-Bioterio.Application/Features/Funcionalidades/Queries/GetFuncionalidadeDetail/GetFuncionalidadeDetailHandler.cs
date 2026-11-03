using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Funcionalidades.Queries.GetFuncionalidadeDetail
{
    public class GetFuncionalidadeDetailHandler : IRequestHandler<GetFuncionalidadeDetailQuery, FuncionalidadeDetailVm>
    {
        private readonly IFuncionalidadeRepository _repository;
        private readonly IMapper _mapper;

        public GetFuncionalidadeDetailHandler(IFuncionalidadeRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<FuncionalidadeDetailVm> Handle(GetFuncionalidadeDetailQuery request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id);
            return _mapper.Map<FuncionalidadeDetailVm>(entity);
        }
    }
}
