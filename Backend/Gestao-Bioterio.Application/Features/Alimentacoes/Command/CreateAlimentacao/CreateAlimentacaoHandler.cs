using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAlimentacaoDetail;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Command.CreateAlimentacao
{
    public class CreateAlimentacaoHandler(
        IMapper mapper,
        IAlimentacaoRepository alimentacaoRepository,
        IAnimalRepository animalRepository,
        IBiometriaAnimalRepository biometriaAnimalRepository,
        IValidator<CreateAlimentacaoCommand> validator
    ) : IRequestHandler<CreateAlimentacaoCommand, CreateAlimentacaoResponse>
    {
        public async Task<CreateAlimentacaoResponse> Handle(CreateAlimentacaoCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateAlimentacaoResponse();
            var validationResult = await validator.ValidateAsync(command, cancellationToken);

            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da alimentação do Animal.";
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

            if (command.Refeicoes == null || !command.Refeicoes.Any())
            {
                response.Success = false;
                response.Message = "É necessário cadastrar pelo menos uma refeição.";
                return response;
            }

            foreach (var refDto in command.Refeicoes)
            {
                if (refDto.PesoRefeicao <= 0)
                {
                    response.Success = false;
                    response.Message = "O peso das refeições deve ser maior que 0.";
                    return response;
                }
            }

            var alimentacao = mapper.Map<Alimentacao>(command);

            if (command.Peso.HasValue && command.Peso.Value > 0)
            {
                decimal? comprimentoAnterior = null;
                decimal? comprimentoCaudaAnterior = null;

                var biometrias = await biometriaAnimalRepository.GetBiometriaAsync(command.AnimalId);
                var biometriaAnterior = biometrias.OrderByDescending(b => b.Id).FirstOrDefault();
                if (biometriaAnterior != null)
                {
                    comprimentoAnterior = biometriaAnterior.Comprimento;
                    comprimentoCaudaAnterior = biometriaAnterior.ComprimentoCauda;
                }
                var biometria = new BiometriaAnimal
                {
                    AnimalId = command.AnimalId,
                    Peso = command.Peso.Value,
                    Comprimento = command.Comprimento.HasValue && command.Comprimento > 0 
                        ? command.Comprimento 
                        : comprimentoAnterior,
                    ComprimentoCauda = comprimentoCaudaAnterior,
                    DataBiometria = command.DataAlimentacao ?? DateTime.UtcNow
                };
                var savedBiometria = await biometriaAnimalRepository.AddAsync(biometria);
                alimentacao.BiometriaAnimalId = savedBiometria.Id;
            }
            else
            {
                alimentacao.BiometriaAnimalId = null;
            }

            foreach (var refeicao in alimentacao.Refeicoes)
            {
                refeicao.UnidadeDeMedida = refeicao.TipoRefeicao == Gestao_Bioterio.Domain.Entities.TipoRefeicao.Via_Sonda ? "ml" : "g";
            }

            alimentacao.PesoRecomendado = command.PesoRecomendado;
            alimentacao.PorcentagemPesoRecomendado = command.PorcentagemPesoRecomendado;

            alimentacao.RecalcularTotais();
            alimentacao.RecalcularStatus();

            var savedAlimentacao = await alimentacaoRepository.AddAsync(alimentacao);

            response.Id = savedAlimentacao.Id;
            response.Alimentacao = mapper.Map<GetAlimentacaoDetailVm>(savedAlimentacao);
            response.Message = "Alimentação registrada com sucesso!";

            return response;
        }
    }
}
