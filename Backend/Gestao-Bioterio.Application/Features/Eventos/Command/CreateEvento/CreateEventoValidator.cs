using FluentValidation;

namespace Gestao_Bioterio.Application.Features.Eventos.Command.CreateEvento
{
    public class CreateEventoValidator : AbstractValidator<CreateEventoCommand>
    {
        public CreateEventoValidator()
        {
            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("O nome do evento é obrigatório.")
                .MaximumLength(200).WithMessage("O nome do evento não pode exceder 200 caracteres.");

            RuleFor(p => p.TipoEvento)
                .IsInEnum().WithMessage("Tipo de evento inválido.");

            RuleFor(p => p.DataHoraInicio)
                .NotEmpty().WithMessage("A data/hora de início é obrigatória.");

            RuleFor(p => p.DataHoraPrevisaoRetorno)
                .GreaterThan(p => p.DataHoraInicio).WithMessage("A previsão de retorno deve ser posterior à data/hora de início.");

            RuleFor(p => p.Responsavel)
                .NotEmpty().WithMessage("O responsável pelo evento é obrigatório.")
                .MaximumLength(200).WithMessage("O nome do responsável não pode exceder 200 caracteres.");
        }
    }
}
