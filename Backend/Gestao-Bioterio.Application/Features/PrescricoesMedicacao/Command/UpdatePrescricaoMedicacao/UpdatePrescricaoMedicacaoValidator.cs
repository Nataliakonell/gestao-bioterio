using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.UpdatePrescricaoMedicacao
{
    public class UpdatePrescricaoMedicacaoValidator : AbstractValidator<UpdatePrescricaoMedicacaoCommand>
    {
        private readonly IMedicacaoRepository _medicacaoRepository;

        public UpdatePrescricaoMedicacaoValidator(IMedicacaoRepository medicacaoRepository)
        {
            _medicacaoRepository = medicacaoRepository;

            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Id é obrigatório.");

            RuleFor(x => x.AnimalId)
                .GreaterThan(0)
                .WithMessage("Animal é obrigatório.");

            RuleFor(x => x.MedicacaoId)
                .GreaterThan(0)
                .WithMessage("Medicação é obrigatória.")
                .MustAsync(MedicacaoExists)
                .WithMessage("A medicação informada não existe.");

            RuleFor(x => x.ViaAdministracao)
                .IsInEnum()
                .WithMessage("Via de administração inválida.");

            RuleFor(x => x.VolumeDose)
                .NotEmpty().WithMessage("Volume da dose é obrigatório.")
                .MaximumLength(100).WithMessage("Volume da dose deve ter no máximo 100 caracteres.");

            RuleFor(x => x.QuantidadeDoses)
                .GreaterThan(0)
                .WithMessage("Quantidade de doses deve ser maior que zero.");

            RuleFor(x => x.IntervaloEntreDosesHoras)
                .GreaterThan(0)
                .WithMessage("Intervalo entre doses deve ser maior que zero.")
                .When(x => x.QuantidadeDoses > 1);

            RuleFor(x => x.IntervaloEntreDosesHoras)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Intervalo entre doses não pode ser negativo.")
                .When(x => x.QuantidadeDoses == 1);

            RuleFor(x => x.DataHoraInicio)
                .NotEmpty()
                .WithMessage("Data e hora de início são obrigatórias.");

            RuleFor(x => x.Observacao)
                .MaximumLength(1000);
        }

        private async Task<bool> MedicacaoExists(int medicacaoId, CancellationToken cancellationToken)
        {
            var medicacao = await _medicacaoRepository.GetByIdAsync(medicacaoId);
            return medicacao != null;
        }
    }
}