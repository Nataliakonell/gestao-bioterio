using FluentValidation;
using Gestao_Bioterio.Application.Common.Validation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Command.UpdateAlimentacao 
{
    public class UpdateALimentacaoValidator : AbstractValidator<UpdateAlimentacaoCommand>
    {
        private readonly IAlimentacaoRepository _alimentacaoRepository;
        private readonly IAnimalRepository _animalRepository;

        public UpdateALimentacaoValidator(IAlimentacaoRepository alimentacaoRepository, IAnimalRepository animalRepository)
        {
            _alimentacaoRepository = alimentacaoRepository;
            _animalRepository = animalRepository;

            RuleFor(p => p.AnimalId)
                .AnimalDeveEstarVivo(_animalRepository, "alimentação");

            RuleFor(p => p.DataAlimentacao)
                .LessThanOrEqualTo(DateTime.Now).WithMessage("A data da alimentação não pode ser futura.")
                .When(p => p.DataAlimentacao.HasValue);
        }
    }
}
