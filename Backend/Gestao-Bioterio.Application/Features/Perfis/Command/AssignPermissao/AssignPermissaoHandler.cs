using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.AssignPermissao
{
    public class AssignPermissaoHandler : IRequestHandler<AssignPermissaoCommand, BaseResponse>
    {
        private readonly IPerfilPermissaoRepository _repository;
        private readonly IMapper _mapper;
        private readonly IValidator<AssignPermissaoCommand> _validator;

        public AssignPermissaoHandler(IPerfilPermissaoRepository repository, IMapper mapper, IValidator<AssignPermissaoCommand> validator)
        {
            _repository = repository;
            _mapper = mapper;
            _validator = validator;
        }

        public async Task<BaseResponse> Handle(AssignPermissaoCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var existing = await _repository.GetPermissaoEspecificaAsync(request.PerfilId, request.FuncionalidadeId);

            if (existing != null)
            {
                existing.NivelAcesso = request.NivelAcesso;
                await _repository.UpdateAsync(existing);
            }
            else
            {
                var entity = new PerfilPermissao
                {
                    PerfilId = request.PerfilId,
                    FuncionalidadeId = request.FuncionalidadeId,
                    NivelAcesso = request.NivelAcesso
                };
                await _repository.AddAsync(entity);
            }

            response.Success = true;
            response.Message = "Permissão associada ao perfil com sucesso.";

            return response;
        }
    }
}
