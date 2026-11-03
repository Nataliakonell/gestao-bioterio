using FluentValidation;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Command.CreateModeloDocumento
{
    public class CreateModeloDocumentoValidator : AbstractValidator<CreateModeloDocumentoCommand>
    {
        public CreateModeloDocumentoValidator()
        {
            RuleFor(x => x.Nome)
                .NotEmpty().WithMessage("O nome do modelo é obrigatório.")
                .MaximumLength(150).WithMessage("O nome do modelo deve ter no máximo 150 caracteres.");
        }
    }
}
