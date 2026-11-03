using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Command.CreateEvolucao
{
    public class CreateEvolucaoHandler(
        IMapper mapper,
        IEvolucaoRepository evolucaoRepository,
        IValidator<CreateEvolucaoCommand> validator
    ) : IRequestHandler<CreateEvolucaoCommand, CreateEvolucaoResponse>
    {
        public async Task<CreateEvolucaoResponse> Handle(CreateEvolucaoCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateEvolucaoResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação do cadastro de evolução.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var evolucao = new Evolucao
            {
                AnimalId = request.AnimalId,
                Descricao = request.Descricao,
                DataHoraRegistro = request.DataHoraRegistro,
                Responsavel = request.Responsavel
            };

            evolucao = await evolucaoRepository.AddAsync(evolucao);

            response.Id = evolucao.Id;
            response.Evolucao = mapper.Map<CreateEvolucaoDto>(evolucao);
            response.Message = "Evolução cadastrada com sucesso!";
            return response;
        }
    }
}