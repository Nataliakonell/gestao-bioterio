using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Funcionalidades.Queries.GetAllFuncionalidade
{
    public class GetAllFuncionalidadeHandler : IRequestHandler<GetAllFuncionalidadeQuery, List<FuncionalidadeListVm>>
    {
        private readonly IFuncionalidadeRepository _repository;
        private readonly IMapper _mapper;

        public GetAllFuncionalidadeHandler(IFuncionalidadeRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<FuncionalidadeListVm>> Handle(GetAllFuncionalidadeQuery request, CancellationToken cancellationToken)
        {
            var list = await _repository.ListAllAsync();
            return _mapper.Map<List<FuncionalidadeListVm>>(list);
        }
    }
}
