using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Command.CreateRefeicao
{
    public class CreateRefeicaoValidator : AbstractValidator<CreateRefeicaoCommand>
    {
        private readonly IAlimentacaoRepository _alimentacaoRepository;

        public CreateRefeicaoValidator(IAlimentacaoRepository alimentacaoRepository)
        {
            _alimentacaoRepository = alimentacaoRepository;

            RuleFor(p => p.AlimentacaoId)
                .NotEmpty().WithMessage("Alimentação é obrigatória.")
                .MustAsync(AlimentacaoExists).WithMessage("A alimentação informada não existe.");

            RuleFor(p => p.TipoRefeicao)
                .IsInEnum().WithMessage("Tipo de refeição inválido.");

            RuleFor(p => p.PesoRefeicao)
                .NotEmpty().WithMessage("Peso da refeição é obrigatória.")
                .GreaterThan(0).WithMessage("Peso da refeição deve ser maior que 0.");

            RuleFor(p => p.SituacaoRefeicao)
                .IsInEnum().WithMessage("Situação da refeição inválida.");
        }

        private async Task<bool> AlimentacaoExists(int alimentacaoId, CancellationToken cancellationToken)
        {
            var alimentacao = await _alimentacaoRepository.GetByIdAsync(alimentacaoId);
            return alimentacao != null;
        }
    }
}
