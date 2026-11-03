using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Usuarios.Command.UpdateUsuario
{
    public class UpdateUsuarioValidator : AbstractValidator<UpdateUsuarioCommand>
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public UpdateUsuarioValidator(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;

            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("O Id é obrigatório para atualização.");

            RuleFor(p => p.RF)
                .NotEmpty().WithMessage("O RF é obrigatório.")
                .MaximumLength(50).WithMessage("O RF não deve exceder 50 caracteres.")
                .MustAsync(RfIsUnique).WithMessage("Um usuário com este RF já está cadastrado.");

            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("O nome é obrigatório.")
                .MaximumLength(150).WithMessage("O nome não deve exceder 150 caracteres.");

            RuleFor(p => p.Email)
                .NotEmpty().WithMessage("O e-mail é obrigatório.")
                .EmailAddress().WithMessage("O e-mail informado não é válido.")
                .MaximumLength(150).WithMessage("O e-mail não deve exceder 150 caracteres.")
                .MustAsync(EmailIsUnique).WithMessage("Um usuário com este e-mail já está cadastrado.");

            RuleFor(p => p.PerfilId)
                .GreaterThan(0).WithMessage("O Perfil é obrigatório.");
        }

        private async Task<bool> RfIsUnique(UpdateUsuarioCommand command, string rf, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(rf)) return true;
            return await _usuarioRepository.IsRfUniqueAsync(rf, command.Id);
        }

        private async Task<bool> EmailIsUnique(UpdateUsuarioCommand command, string email, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(email)) return true;
            return await _usuarioRepository.IsEmailUniqueAsync(email, command.Id);
        }
    }
}
