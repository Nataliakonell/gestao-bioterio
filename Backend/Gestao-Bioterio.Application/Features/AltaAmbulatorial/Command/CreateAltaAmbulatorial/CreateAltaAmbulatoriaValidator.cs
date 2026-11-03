using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.CreateAltaAmbulatorial
{
    public class CreateAltaAmbulatoriaValidator : AbstractValidator<CreateAltaAmbulatoriaCommand>
    {
        private readonly IAltaAmbulatoriaRepository _repository;
        private readonly IAnimalRepository _animalRepository;
        private readonly IInstalacaoBioterioRepository _instalacaoRepository;

        public CreateAltaAmbulatoriaValidator(
            IAltaAmbulatoriaRepository repository,
            IAnimalRepository animalRepository,
            IInstalacaoBioterioRepository instalacaoRepository)
        {
            _repository = repository;
            _animalRepository = animalRepository;
            _instalacaoRepository = instalacaoRepository;

            RuleFor(x => x.AnimalId)
                .GreaterThan(0).WithMessage("O AnimalId é obrigatório.");

            RuleFor(x => x.AnimalId)
                .MustAsync(async (animalId, ct) =>
                {
                    if (animalId <= 0) return false;
                    var animal = await _animalRepository.GetByIdAsync(animalId);
                    return animal != null;
                })
                .WithMessage("O animal informado não foi encontrado.");

            RuleFor(x => x.InstalacaoBioterioRetornoId)
                .MustAsync(async (instalacaoId, ct) =>
                {
                    if (!instalacaoId.HasValue || instalacaoId.Value <= 0) return true;
                    var inst = await _instalacaoRepository.GetByIdAsync(instalacaoId.Value);
                    return inst != null;
                })
                .WithMessage("A instalação de retorno informada não foi encontrada.");
        }
    }
}
