using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Command.CreateMedicacao
{
    public class CreateMedicacaoHandler(
        IMapper mapper,
        IMedicacaoRepository medicacaoRepository,
        IValidator<CreateMedicacaoCommand> validator
    ) : IRequestHandler<CreateMedicacaoCommand, CreateMedicacaoResponse>
    {
        public async Task<CreateMedicacaoResponse> Handle(CreateMedicacaoCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateMedicacaoResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação do cadastro de medicação.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var medicacao = new Medicacao
            {
                PrincipioAtivo = request.PrincipioAtivo,
                NomeComercial = request.NomeComercial,
                Ativo = true
            };

            medicacao = await medicacaoRepository.AddAsync(medicacao);

            response.Id = medicacao.Id;
            response.Medicacao = mapper.Map<CreateMedicacaoDto>(medicacao);
            response.Message = "Medicação cadastrada com sucesso!";
            return response;
        }
    }
}