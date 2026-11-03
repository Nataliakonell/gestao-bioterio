using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Species.Command.CreateSpecie
{
    public class CreateEspecieValidator : AbstractValidator<CreateEspecieCommand>
    {
        private readonly IEspecieRepository _specieRepository;
        private readonly IGrupoRepository _grupoRepository;

        public CreateEspecieValidator(IEspecieRepository specieRepository, IGrupoRepository grupoRepository)
        {
            _specieRepository = specieRepository;
            _grupoRepository = grupoRepository;

            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("O nome da espécie é obrigatório.")
                .NotNull()
                .MaximumLength(150).WithMessage("O nome da espécie não deve exceder 150 caracteres.")
                .MustAsync(EspecieNameUnique).WithMessage("Esta espécie já está cadastrada.");

            RuleFor(p => p.NomePopular)
                .NotEmpty().WithMessage("O nome popular é obrigatório.")
                .NotNull()
                .MaximumLength(150).WithMessage("O nome popular não deve exceder 150 caracteres.");

            RuleFor(p => p.GrupoId)
                .Cascade(CascadeMode.Stop)
                .GreaterThan(0).WithMessage("Selecione um grupo válido.")
                .MustAsync(GrupoExists).WithMessage("O grupo informado não existe.");
        }

        private async Task<bool> GrupoExists(int grupoId, CancellationToken cancellationToken)
        {
            return await _grupoRepository.GetByIdAsync(grupoId) != null;
        }

        private async Task<bool> EspecieNameUnique(string nome, CancellationToken cancellationToken)
        {
            return await _specieRepository.EspecieIsUnique(nome);
        }
    }
}
