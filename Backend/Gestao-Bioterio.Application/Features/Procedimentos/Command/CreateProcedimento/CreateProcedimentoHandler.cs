using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Command.CreateProcedimento
{
    public class CreateProcedimentoHandler(
        IMapper mapper,
        IProcedimentoRepository procedimentoRepository,
        IValidator<CreateProcedimentoCommand> validator
    ) : IRequestHandler<CreateProcedimentoCommand, CreateProcedimentoResponse>
    {
        public async Task<CreateProcedimentoResponse> Handle(CreateProcedimentoCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateProcedimentoResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação do cadastro de procedimento.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var procedimento = new Procedimento
            {
                AnimalId = request.AnimalId,
                TipoProcedimentoId = request.TipoProcedimentoId,
                Descricao = request.Descricao,
                Responsavel = request.Responsavel
            };

            procedimento = await procedimentoRepository.AddAsync(procedimento);

            response.Id = procedimento.Id;
            response.Procedimento = mapper.Map<CreateProcedimentoDto>(procedimento);
            response.Message = "Procedimento cadastrado com sucesso!";
            return response;
        }
    }
}