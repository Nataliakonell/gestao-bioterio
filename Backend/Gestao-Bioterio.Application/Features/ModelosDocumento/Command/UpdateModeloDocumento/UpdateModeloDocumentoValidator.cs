using FluentValidation;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Command.UpdateModeloDocumento
{
    public class UpdateModeloDocumentoValidator : AbstractValidator<UpdateModeloDocumentoCommand>
    {
        public UpdateModeloDocumentoValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("O ID do modelo é obrigatório.");

            RuleFor(x => x.Nome)
                .NotEmpty().WithMessage("O nome do modelo é obrigatório.")
                .MaximumLength(150).WithMessage("O nome do modelo deve ter no máximo 150 caracteres.");
        }
    }
}
