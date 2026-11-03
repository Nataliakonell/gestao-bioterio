using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Command.UpdateEvolucao
{
    public class UpdateEvolucaoHandler(
        IMapper mapper,
        IEvolucaoRepository evolucaoRepository,
        IValidator<UpdateEvolucaoCommand> validator
    ) : IRequestHandler<UpdateEvolucaoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateEvolucaoCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                return new BaseResponse("Erro na validação da atualização da evolução.", false)
                {
                    ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                };
            }

            var evolucao = await evolucaoRepository.GetByIdAsync(request.Id);
            if (evolucao == null)
                throw new NotFoundException(nameof(Evolucao), request.Id);

            mapper.Map(request, evolucao);
            await evolucaoRepository.UpdateAsync(evolucao);

            return new BaseResponse("Evolução atualizada com sucesso!");
        }
    }
}