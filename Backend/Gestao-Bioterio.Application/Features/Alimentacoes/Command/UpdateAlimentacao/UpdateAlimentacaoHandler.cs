using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAlimentacaoDetail;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Command.UpdateAlimentacao
{
    public class UpdateAlimentacaoHandler(
        IMapper mapper,
        IAlimentacaoRepository alimentacaoRepository,
        IAnimalRepository animalRepository,
        IValidator<UpdateAlimentacaoCommand> validator
    ) : IRequestHandler<UpdateAlimentacaoCommand, UpdateAlimentacaoResponse>
    {
        public async Task<UpdateAlimentacaoResponse> Handle(UpdateAlimentacaoCommand command, CancellationToken cancellationToken)
        {
            var response = new UpdateAlimentacaoResponse();

            var alimentacao = await alimentacaoRepository.GetAlimentacaoWithDetailsAsync(command.Id);
            if (alimentacao == null)
                throw new NotFoundException(nameof(Alimentacao), command.Id);

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da atualização da alimentação.";
                return response;
            }

            var animal = await animalRepository.GetByIdAsync(command.AnimalId);
            if (animal == null)
            {
                response.Success = false;
                response.Message = $"Animal com ID {command.AnimalId} não encontrado.";
                return response;
            }

            if (animal.SituacaoAnimal != Situacao.Vivo)
            {
                response.Success = false;
                response.Message = $"Não é permitido registrar alimentação para animal com situação '{animal.SituacaoAnimal}'.";
                response.ValidationErrors = new List<string> { response.Message };
                return response;
            }

            if (command.DataAlimentacao.HasValue)
            {
                alimentacao.DataAlimentacao = command.DataAlimentacao.Value;
            }

            if (alimentacao.BiometriaAnimal != null && command.Peso.HasValue)
            {
                alimentacao.BiometriaAnimal.Peso = command.Peso.Value;
                alimentacao.BiometriaAnimal.Comprimento = command.Comprimento;
            }

            alimentacao.Observacoes = command.Observacoes;

            if (command.Refeicoes != null && command.Refeicoes.Any())
            {
                var idsInCommand = command.Refeicoes.Where(r => r.Id.HasValue).Select(r => r.Id.Value).ToList();
                var toRemove = alimentacao.Refeicoes.Where(r => !idsInCommand.Contains(r.Id)).ToList();
                foreach (var r in toRemove)
                {
                    alimentacao.Refeicoes.Remove(r);
                }

                foreach (var refDto in command.Refeicoes)
                {
                    if (refDto.Id.HasValue && refDto.Id.Value > 0)
                    {
                        var existing = alimentacao.Refeicoes.FirstOrDefault(r => r.Id == refDto.Id.Value);
                        if (existing != null)
                        {
                            existing.TipoRefeicao = refDto.TipoRefeicao;
                            existing.PesoRefeicao = refDto.PesoRefeicao;
                            existing.SituacaoRefeicao = refDto.SituacaoRefeicao;
                            existing.UnidadeDeMedida = refDto.TipoRefeicao == Gestao_Bioterio.Domain.Entities.TipoRefeicao.Via_Sonda ? "ml" : "g";
                        }
                    }
                    else
                    {
                        alimentacao.Refeicoes.Add(new Refeicao 
                        {
                            AlimentacaoId = alimentacao.Id,
                            TipoRefeicao = refDto.TipoRefeicao,
                            PesoRefeicao = refDto.PesoRefeicao,
                            SituacaoRefeicao = refDto.SituacaoRefeicao,
                            UnidadeDeMedida = refDto.TipoRefeicao == Gestao_Bioterio.Domain.Entities.TipoRefeicao.Via_Sonda ? "ml" : "g"
                        });
                    }
                }
            }

            alimentacao.PesoRecomendado = command.PesoRecomendado;
            alimentacao.PorcentagemPesoRecomendado = command.PorcentagemPesoRecomendado;

            alimentacao.RecalcularTotais();
            alimentacao.RecalcularStatus();

            await alimentacaoRepository.SaveAlimentacaoUpdateAsync();

            var updatedAlimentacao = await alimentacaoRepository.GetAlimentacaoWithDetailsAsync(alimentacao.Id);

            response.Id = alimentacao.Id;
            response.Alimentacao = mapper.Map<GetAlimentacaoDetailVm>(updatedAlimentacao ?? alimentacao);
            response.Message = "Alimentação atualizada com sucesso!";

            return response;
        }
    }
}
