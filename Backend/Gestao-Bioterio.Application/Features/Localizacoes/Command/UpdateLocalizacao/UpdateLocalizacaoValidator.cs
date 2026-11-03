using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Command.UpdateLocalizacao
{
    public class UpdateLocalizacaoValidator : AbstractValidator<UpdateLocalizacaoCommand>
    {
        private readonly ILocalizacaoRepository _localizacaoRepository;

        public UpdateLocalizacaoValidator(ILocalizacaoRepository localizacaoRepository)
        {
            _localizacaoRepository = localizacaoRepository;

            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("O identificador da localização é obrigatório.");

            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("O nome da localização é obrigatório.")
                .MaximumLength(200).WithMessage("O nome não pode exceder 200 caracteres.");

            RuleFor(p => p.Ambiente)
                .IsInEnum().WithMessage("Ambiente inválido.");

            RuleFor(p => p)
                .Must(p => !p.LocalizacaoPaiId.HasValue || p.LocalizacaoPaiId.Value != p.Id)
                .WithMessage("Uma localização não pode ser pai dela mesma.");

            RuleFor(p => p.LocalizacaoPaiId)
                .MustAsync(async (paiId, cancellation) =>
                {
                    if (!paiId.HasValue || paiId.Value <= 0) return true;
                    var pai = await _localizacaoRepository.GetByIdAsync(paiId.Value);
                    return pai != null;
                })
                .WithMessage("A localização pai informada não existe.");
        }
    }
}
