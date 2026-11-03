using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Command.CreateRotinaAnimal;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Command.UpdateRotinaAnimal
{
    public class UpdateRotinaAnimalValidator : AbstractValidator<UpdateRotinaAnimalCommand>
    {
        private readonly IEspecieRepository _especieRepository;

        public UpdateRotinaAnimalValidator(IRotinaAnimalRepository rotinaAnimalRepository, IEspecieRepository especieRepository)
        {
            _especieRepository = especieRepository;

            RuleFor(p => p.EspecieId)
                .NotEmpty().WithMessage("ID da espécie é obrigatório.")
                .MustAsync(EspecieExists).WithMessage("A espécie informada não existe.");

            RuleFor(x => x.TipoRotina)
                .IsInEnum()
                .WithMessage("Tipo de rotina inválido.");

            RuleFor(x => x.Fases)
                .NotEmpty()
                .WithMessage("Pelo menos uma fase de vida deve ser configurada.");

            RuleForEach(x => x.Fases).SetValidator(new RotinaUpdateFaseConfigValidator());
        }

        private async Task<bool> EspecieExists(int especieId, CancellationToken cancellationToken)
        {
            var especie = await _especieRepository.GetByIdAsync(especieId);
            return especie != null;
        }
    }

    public class RotinaUpdateFaseConfigValidator : AbstractValidator<RotinaFaseConfig>
    {
        public RotinaUpdateFaseConfigValidator()
        {
            RuleFor(x => x.FaseDeVida)
                .IsInEnum()
                .WithMessage("Fase de vida inválida.");

            RuleFor(x => x.TipoFrequencia)
                .IsInEnum()
                .WithMessage("Tipo de frequência inválido.");

            When(x => x.TipoFrequencia == TipoFrequencia.IntervaloEmDias, () =>
            {
                RuleFor(x => x.Frequencia)
                    .NotNull()
                    .GreaterThan(0)
                    .WithMessage("Informe o intervalo de dias para a frequência.");
            });

            When(x => x.TipoFrequencia == TipoFrequencia.DiasDaSemana, () =>
            {
                RuleFor(x => x.DiaSemanaProgramado)
                    .NotEmpty()
                    .WithMessage("Informe ao menos um dia da semana.")
                    .Must(dias => dias != null && dias.All(d => new[] { "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" }.Contains(d)))
                    .WithMessage("Dias da semana devem ser: Domingo, Segunda, Terça, Quarta, Quinta, Sexta, Sábado.");
            });
        }
    }
}