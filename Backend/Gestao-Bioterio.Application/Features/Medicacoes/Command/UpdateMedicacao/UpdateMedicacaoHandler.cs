using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Command.UpdateMedicacao
{
    public class UpdateMedicacaoHandler(
        IMedicacaoRepository medicacaoRepository,
        IValidator<UpdateMedicacaoCommand> validator
    ) : IRequestHandler<UpdateMedicacaoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateMedicacaoCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação da atualização de medicação.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var medicacao = await medicacaoRepository.GetByIdAsync(request.Id);
            if (medicacao == null)
                throw new NotFoundException(nameof(Medicacao), request.Id);

            medicacao.PrincipioAtivo = request.PrincipioAtivo;
            medicacao.NomeComercial = request.NomeComercial;
            medicacao.Ativo = request.Ativo;

            await medicacaoRepository.UpdateAsync(medicacao);

            response.Message = "Medicação atualizada com sucesso!";
            return response;
        }
    }
}