using FluentValidation;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.UpdateProtocoloDesverminacao
{
    public class UpdateProtocoloDesverminacaoValidator : AbstractValidator<UpdateProtocoloDesverminacaoCommand>
    {
        public UpdateProtocoloDesverminacaoValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Protocolo de desverminação é obrigatório.");

            RuleFor(x => x.DataEntrada)
                .NotEqual(default(DateTime))
                .WithMessage("Data de entrada é obrigatória.");

            RuleFor(x => x.StatusProtocolo)
                .IsInEnum()
                .WithMessage("Status do protocolo inválido.");
        }
    }
}