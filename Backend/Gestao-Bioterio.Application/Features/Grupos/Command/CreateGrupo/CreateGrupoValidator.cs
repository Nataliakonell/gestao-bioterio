using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Groups.Command.CreateGroup
{
    public class CreateGrupoValidator : AbstractValidator<CreateGrupoCommand>
    {
        private readonly IGrupoRepository _groupRepository;

        public CreateGrupoValidator(IGrupoRepository groupRepository)
        {
            _groupRepository = groupRepository;

            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("O nome do grupo é obrigatório.")
                .NotNull()
                .MaximumLength(100).WithMessage("O nome do grupo não deve exceder 100 caracteres.");
        }
    }
}