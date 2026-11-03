using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Common.Validation
{
    public static class AnimalValidationExtensions
    {
        public static IRuleBuilderOptions<T, int> AnimalDeveEstarVivo<T>(
            this IRuleBuilderInitial<T, int> ruleBuilder,
            IAnimalRepository animalRepository,
            string nomeOperacao = "este registro")
        {
            return ruleBuilder
                .Cascade(CascadeMode.Stop)
                .GreaterThan(0).WithMessage("Animal é obrigatório.")
                .MustAsync(async (animalId, ct) =>
                {
                    var animal = await animalRepository.GetByIdAsync(animalId);
                    return animal != null;
                }).WithMessage("Animal informado não encontrado.")
                .MustAsync(async (animalId, ct) =>
                {
                    return await animalRepository.IsAnimalVivoAsync(animalId, ct);
                }).WithMessage($"Não é permitido registrar {nomeOperacao} para animal com situação 'Óbito' ou 'Reintroduzido'.");
        }
    }
}
