using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.UpdateMedicacaoAdministrada
{
    public class UpdateMedicacaoAdministradaValidator : AbstractValidator<UpdateMedicacaoAdministradaCommand>
    {
        private readonly IPrescricaoMedicacaoRepository _prescricaoMedicacaoRepository;

        public UpdateMedicacaoAdministradaValidator(IPrescricaoMedicacaoRepository prescricaoMedicacaoRepository)
        {
            _prescricaoMedicacaoRepository = prescricaoMedicacaoRepository;

            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Id é obrigatório.");

            RuleFor(x => x.PrescricaoMedicacaoId)
                .GreaterThan(0)
                .WithMessage("Prescrição de medicação é obrigatória.")
                .MustAsync(PrescricaoMedicacaoExists)
                .WithMessage("A prescrição de medicação informada não existe.");

            RuleFor(x => x.DataHoraPrevista)
                .NotEmpty()
                .WithMessage("Data e hora prevista da dose são obrigatórias.");

            RuleFor(x => x.Responsavel)
                .NotEmpty().WithMessage("Responsável é obrigatório.")
                .When(x => x.StatusDose == StatusDose.Concluido);

            RuleFor(x => x.Responsavel)
                .MaximumLength(200).WithMessage("Responsável deve ter no máximo 200 caracteres.");

            RuleFor(x => x.StatusDose)
                .IsInEnum()
                .WithMessage("Status da dose inválido.");

            RuleFor(x => x.Observacao)
                .MaximumLength(1000);
        }

        private async Task<bool> PrescricaoMedicacaoExists(int prescricaoMedicacaoId, CancellationToken cancellationToken)
        {
            var prescricao = await _prescricaoMedicacaoRepository.GetByIdAsync(prescricaoMedicacaoId);
            return prescricao != null;
        }
    }
}