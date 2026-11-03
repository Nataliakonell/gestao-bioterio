using FluentValidation;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Command.CreateRotinaAnimal
{
    public class CreateRotinaAnimalValidator : AbstractValidator<CreateRotinaAnimalCommand>
    {
        public CreateRotinaAnimalValidator()
        {
            RuleFor(x => x.EspecieId)
                .GreaterThan(0)
                .WithMessage("Espécie é obrigatória.");

            RuleFor(x => x.TipoRotina)
                .IsInEnum()
                .WithMessage("Tipo de rotina inválido.");

            RuleFor(x => x.ProtocoloDieta)
                .MaximumLength(1000);

            RuleFor(x => x.Fases)
                .NotEmpty()
                .WithMessage("Pelo menos uma fase de vida deve ser configurada.");

            RuleFor(x => x.Fases)
                .Must(fases => fases.Select(f => f.FaseDeVida).Contains(FaseDeVida.Filhote))
                .WithMessage("A fase Filhote é obrigatória.")
                .Must(fases => fases.Select(f => f.FaseDeVida).Contains(FaseDeVida.Jovem))
                .WithMessage("A fase Jovem é obrigatória.")
                .Must(fases => fases.Select(f => f.FaseDeVida).Contains(FaseDeVida.Adulto))
                .WithMessage("A fase Adulto é obrigatória.")
                .Must(fases => fases.All(f => f.FaseDeVida != FaseDeVida.Todos))
                .WithMessage("A opção 'Todas as fases' não é permitida. Informe cada fase individualmente.");

            RuleForEach(x => x.Fases).SetValidator(new RotinaFaseConfigValidator());
        }
    }

    public class RotinaFaseConfigValidator : AbstractValidator<RotinaFaseConfig>
    {
        public RotinaFaseConfigValidator()
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
