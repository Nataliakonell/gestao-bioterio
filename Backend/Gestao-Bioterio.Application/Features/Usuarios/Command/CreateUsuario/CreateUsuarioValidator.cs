using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Usuarios.Command.CreateUsuario
{
    public class CreateUsuarioValidator : AbstractValidator<CreateUsuarioCommand>
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public CreateUsuarioValidator(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;

            RuleFor(p => p.RF)
                .NotEmpty().WithMessage("O RF é obrigatório.")
                .MaximumLength(50).WithMessage("O RF não deve exceder 50 caracteres.")
                .MustAsync(RfIsUnique).WithMessage("Um usuário com este RF já está cadastrado.");

            RuleFor(p => p.PerfilId)
                .GreaterThan(0).WithMessage("O Perfil é obrigatório.");
        }

        private async Task<bool> RfIsUnique(string rf, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(rf)) return true;
            return await _usuarioRepository.IsRfUniqueAsync(rf);
        }
    }
}
