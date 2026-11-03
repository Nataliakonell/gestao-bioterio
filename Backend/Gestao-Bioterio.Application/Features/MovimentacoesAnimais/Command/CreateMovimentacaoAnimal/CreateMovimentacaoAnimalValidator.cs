using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.CreateMovimentacaoAnimal
{
    public class CreateMovimentacaoAnimalValidator : AbstractValidator<CreateMovimentacaoAnimalCommand>
    {
        private readonly IAnimalRepository _animalRepository;
        private readonly ILocalizacaoRepository _localizacaoRepository;
        private readonly IEventoRepository _eventoRepository;

        public CreateMovimentacaoAnimalValidator(
            IAnimalRepository animalRepository,
            ILocalizacaoRepository localizacaoRepository,
            IEventoRepository eventoRepository)
        {
            _animalRepository = animalRepository;
            _localizacaoRepository = localizacaoRepository;
            _eventoRepository = eventoRepository;

            RuleFor(p => p.AnimalId)
                .GreaterThan(0).WithMessage("O identificador do animal é obrigatório.")
                .MustAsync(async (animalId, ct) =>
                {
                    var animal = await _animalRepository.GetByIdAsync(animalId);
                    return animal != null;
                })
                .WithMessage("O animal informado não existe.");

            RuleFor(p => p.LocalizacaoId)
                .GreaterThan(0).WithMessage("O identificador da localização é obrigatório.")
                .MustAsync(async (localizacaoId, ct) =>
                {
                    var localizacao = await _localizacaoRepository.GetByIdAsync(localizacaoId);
                    return localizacao != null;
                })
                .WithMessage("A localização informada não existe.");

            RuleFor(p => p.TipoMovimentacao)
                .IsInEnum().WithMessage("Tipo de movimentação inválido.");

            RuleFor(p => p.EventoId)
                .MustAsync(async (eventoId, ct) =>
                {
                    if (!eventoId.HasValue) return true;
                    var evento = await _eventoRepository.GetByIdAsync(eventoId.Value);
                    return evento != null;
                })
                .WithMessage("O evento informado não existe.");
        }
    }
}
