using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.CreateDoseAplicacaoDesverminacao
{
    public class CreateDoseAplicacaoDesverminacaoValidator : AbstractValidator<CreateDoseAplicacaoDesverminacaoCommand>
    {
        private readonly IProtocoloDesverminacaoRepository _protocoloRepository;

        public CreateDoseAplicacaoDesverminacaoValidator(IProtocoloDesverminacaoRepository protocoloRepository)
        {
            _protocoloRepository = protocoloRepository;

            RuleFor(x => x.ProtocoloDesverminacaoId)
                .GreaterThan(0)
                .WithMessage("Protocolo de desverminação é obrigatório.")
                .MustAsync(ProtocoloExists)
                .WithMessage("O protocolo de desverminação informado não existe.");

            RuleFor(x => x.TipoDose)
                .IsInEnum()
                .WithMessage("Tipo de dose inválido.");

            RuleFor(x => x.DataPrevista)
                .NotEqual(default(DateTime))
                .WithMessage("Data prevista é obrigatória.");

            RuleFor(x => x.StatusDoseDesverminacao)
                .IsInEnum()
                .WithMessage("Status da dose inválido.");

            RuleFor(x => x.Observacao)
                .MaximumLength(2000)
                .WithMessage("Observação deve ter no máximo 2000 caracteres.");
        }

        private async Task<bool> ProtocoloExists(int protocoloId, CancellationToken cancellationToken)
        {
            var protocolo = await _protocoloRepository.GetByIdAsync(protocoloId);
            return protocolo != null;
        }
    }
}