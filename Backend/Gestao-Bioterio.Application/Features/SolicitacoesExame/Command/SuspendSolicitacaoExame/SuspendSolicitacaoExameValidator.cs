using FluentValidation;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.SuspendSolicitacaoExame
{
    public class SuspendSolicitacaoExameValidator : AbstractValidator<SuspendSolicitacaoExameCommand>
    {
        public SuspendSolicitacaoExameValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("Id da solicitação é obrigatório.");

            RuleFor(x => x.MotivoSuspensao)
                .NotEmpty().WithMessage("Motivo da suspensão deve ser informado.")
                .MaximumLength(1000).WithMessage("Motivo da suspensão deve ter no máximo 1000 caracteres.")
                .Must(m => !string.IsNullOrWhiteSpace(m)).WithMessage("Motivo da suspensão deve ser informado.");
        }
    }
}
