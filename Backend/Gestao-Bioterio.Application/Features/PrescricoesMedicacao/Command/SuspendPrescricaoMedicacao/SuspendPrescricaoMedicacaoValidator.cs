using FluentValidation;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.SuspendPrescricaoMedicacao
{
    public class SuspendPrescricaoMedicacaoValidator : AbstractValidator<SuspendPrescricaoMedicacaoCommand>
    {
        public SuspendPrescricaoMedicacaoValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("Id da prescrição é obrigatório.");

            RuleFor(x => x.MotivoSuspensao)
                .NotEmpty().WithMessage("Motivo da suspensão deve ser informado.")
                .Must(m => !string.IsNullOrWhiteSpace(m)).WithMessage("Motivo da suspensão deve ser informado.");
        }
    }
}
