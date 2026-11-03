using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Species.Command.UpdateSpecie
{
    public class UpdateEspecieValidator : AbstractValidator<UpdateEspecieCommand>
    {
        private readonly IGrupoRepository _grupoRepository;
        private readonly IEspecieRepository _specieRepository;

        public UpdateEspecieValidator(IGrupoRepository grupoRepository, IEspecieRepository specieRepository)
        {
            _grupoRepository = grupoRepository;
            _specieRepository = specieRepository;

            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("ID da espécie inválido.");

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

        private async Task<bool> EspecieNameUnique(UpdateEspecieCommand command, string nome, CancellationToken cancellationToken)
        {
            return await _specieRepository.EspecieIsUnique(nome, command.Id);
        }
    }
}
