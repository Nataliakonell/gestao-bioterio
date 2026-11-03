using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Command.CreateLocalizacao
{
    public class CreateLocalizacaoValidator : AbstractValidator<CreateLocalizacaoCommand>
    {
        private readonly ILocalizacaoRepository _localizacaoRepository;

        public CreateLocalizacaoValidator(ILocalizacaoRepository localizacaoRepository)
        {
            _localizacaoRepository = localizacaoRepository;

            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("O nome da localização é obrigatório.");

            RuleFor(p => p.Ambiente)
                .IsInEnum().WithMessage("Ambiente inválido.");

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
