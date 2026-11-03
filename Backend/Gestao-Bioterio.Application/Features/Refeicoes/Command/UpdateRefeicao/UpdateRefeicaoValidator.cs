using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Command.UpdateRefeicao
{
    public class UpdateRefeicaoValidator : AbstractValidator<UpdateRefeicaoCommand>
    {
        private readonly IRefeicaoRepository _refeicaoRepository;

        public UpdateRefeicaoValidator(IRefeicaoRepository refeicaoRepository)
        {
            _refeicaoRepository = refeicaoRepository;

            RuleFor(p => p.AlimentacaoId)
                .GreaterThan(0).WithMessage("O ID da alimentacoa é obrigatório para a atualização.");
        }
    }
}
