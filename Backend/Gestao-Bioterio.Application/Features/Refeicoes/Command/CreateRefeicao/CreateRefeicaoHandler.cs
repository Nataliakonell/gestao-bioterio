using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using static Gestao_Bioterio.Domain.Entities.Alimentacao;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Command.CreateRefeicao
{
    public class CreateRefeicaoHandler(
        IMapper mapper,
        IRefeicaoRepository refeicaoRepository,
        IAlimentacaoRepository alimentacaoRepository,
        IValidator<CreateRefeicaoCommand> validator
    ) : IRequestHandler<CreateRefeicaoCommand, CreateRefeicaoResponse>
    {
        public async Task<CreateRefeicaoResponse> Handle(CreateRefeicaoCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateRefeicaoResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = new List<string>();
                foreach (var error in validationResult.Errors)
                {
                    response.ValidationErrors.Add(error.ErrorMessage);
                }
                response.Message = "Erro na validação da refeição.";
                return response;
            }

            var refeicao = mapper.Map<Refeicao>(command);

            string unidade = "g";
            var tiposEmMl = new[] { TipoRefeicao.Via_Sonda };
            if (tiposEmMl.Contains(command.TipoRefeicao))
            {
                unidade = "ml";
            }
            refeicao.UnidadeDeMedida = unidade;

            refeicao = await refeicaoRepository.AddAsync(refeicao);

            var alimentacao = await alimentacaoRepository.GetAlimentacaoWithDetailsAsync(refeicao.AlimentacaoId);
            if (alimentacao != null)
            {
                alimentacao.RecalcularTotais();
                alimentacao.RecalcularStatus();
                await alimentacaoRepository.UpdateAsync(alimentacao);
            }

            response.Id = refeicao.Id;
            response.Refeicao = mapper.Map<CreateRefeicaoDto>(refeicao);
            response.Message = "Refeição adicionada com sucesso!";

            return response;
        }
    }
}
