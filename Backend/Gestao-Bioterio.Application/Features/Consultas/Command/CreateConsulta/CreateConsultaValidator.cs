using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Consultas.Command.CreateConsulta
{
    public class CreateConsultaValidator : AbstractValidator<CreateConsultaCommand>
    {
        public CreateConsultaValidator(IAnimalRepository animalRepository)
        {
            RuleFor(p => p.AnimalId)
                .GreaterThan(0).WithMessage("{PropertyName} é obrigatório.")
                .MustAsync(async (id, token) =>
                {
                    var animal = await animalRepository.GetByIdAsync(id);
                    return animal != null;
                }).WithMessage("Animal informado não foi encontrado.");

            RuleFor(p => p.DataHoraConsulta)
                .NotEmpty().WithMessage("Data/Hora da consulta é obrigatória.");

            RuleFor(p => p.Anamnese)
                .MaximumLength(4000).WithMessage("Anamnese não pode exceder 4000 caracteres.");

            RuleFor(p => p.ExameFisico)
                .MaximumLength(4000).WithMessage("Exame físico não pode exceder 4000 caracteres.");

            RuleFor(p => p.SuspeitaDiagnostica)
                .MaximumLength(2000).WithMessage("Suspeita diagnóstica não pode exceder 2000 caracteres.");
        }
    }
}
