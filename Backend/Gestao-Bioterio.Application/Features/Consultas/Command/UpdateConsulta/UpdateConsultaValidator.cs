using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Consultas.Command.UpdateConsulta
{
    public class UpdateConsultaValidator : AbstractValidator<UpdateConsultaCommand>
    {
        public UpdateConsultaValidator(
            IConsultaRepository repository,
            IAnimalRepository animalRepository)
        {
            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("{PropertyName} é obrigatório.")
                .MustAsync(async (id, token) =>
                {
                    var entity = await repository.GetByIdAsync(id);
                    return entity != null;
                }).WithMessage("Consulta não encontrada.");

            RuleFor(p => p.AnimalId)
                .GreaterThan(0).WithMessage("{PropertyName} é obrigatório.")
                .MustAsync(async (id, token) =>
                {
                    var animal = await animalRepository.GetByIdAsync(id);
                    return animal != null;
                }).WithMessage("Animal informado não foi encontrado.");

            RuleFor(p => p.DataHoraConsulta)
                .NotEmpty().WithMessage("Data/Hora da consulta é obrigatória.");
        }
    }
}
