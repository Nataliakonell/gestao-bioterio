using FluentValidation;
using Gestao_Bioterio.Application.Common.Validation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Command.CreateAlimentacao
{
    public class CreateAlimentacaoValidator : AbstractValidator<CreateAlimentacaoCommand>
    {
        private readonly IAlimentacaoRepository _alimentacaoRepository;
        private readonly IAnimalRepository _animalRepository;

        public CreateAlimentacaoValidator(IAlimentacaoRepository alimentacaoRepository, IAnimalRepository animalRepository)
        {
            _alimentacaoRepository = alimentacaoRepository;
            _animalRepository = animalRepository;

            RuleFor(p => p.AnimalId)
                .AnimalDeveEstarVivo(_animalRepository, "alimentação");

            RuleFor(p => p.DataAlimentacao)
                .NotEmpty().WithMessage("Data da alimentação é obrigatório.");

            RuleFor(p => p.DataAlimentacao)
                .LessThanOrEqualTo(DateTime.Now).WithMessage("A data da alimentação não pode ser futura.")
                .When(p => p.DataAlimentacao.HasValue);

            RuleFor(p => p.Peso)
                .GreaterThan(0).WithMessage("O peso deve ser maior que zero.")
                .When(p => p.Peso.HasValue);

            RuleFor(p => p.Refeicoes)
                .NotEmpty().WithMessage("É necessário mencionar pelo menos uma refeição cadastrada.");

            RuleForEach(p => p.Refeicoes).ChildRules(refeicao =>
            {
                refeicao.RuleFor(r => r.TipoRefeicao)
                    .IsInEnum().WithMessage("Tipo de refeição inválido.");

                refeicao.RuleFor(r => r.PesoRefeicao)
                    .NotEmpty().WithMessage("Peso da refeição é obrigatório.")
                    .GreaterThan(0).WithMessage("Peso da refeição deve ser maior que 0.");

                refeicao.RuleFor(r => r.SituacaoRefeicao)
                    .IsInEnum().WithMessage("Situação da refeição inválida.");
            });

            RuleFor(x => x.PorcentagemPesoRecomendado)
                .InclusiveBetween(0, 100)
                .When(x => x.PorcentagemPesoRecomendado.HasValue);

            RuleFor(x => x.PesoRecomendado)
                .GreaterThan(0)
                .WithMessage("O peso recomendado deve ser maior que zero.");
        }
    }
}
