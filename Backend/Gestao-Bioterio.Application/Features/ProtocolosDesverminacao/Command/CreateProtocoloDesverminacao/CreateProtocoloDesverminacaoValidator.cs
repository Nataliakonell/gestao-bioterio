using FluentValidation;
using Gestao_Bioterio.Application.Common.Validation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.CreateProtocoloDesverminacao
{
    public class CreateProtocoloDesverminacaoValidator : AbstractValidator<CreateProtocoloDesverminacaoCommand>
    {
        private readonly IAnimalRepository _animalRepository;
        private readonly IProtocoloDesverminacaoRepository _protocoloRepository;

        public CreateProtocoloDesverminacaoValidator(
            IAnimalRepository animalRepository,
            IProtocoloDesverminacaoRepository protocoloRepository)
        {
            _animalRepository = animalRepository;
            _protocoloRepository = protocoloRepository;

            RuleFor(x => x.AnimalId)
                .AnimalDeveEstarVivo(_animalRepository, "protocolo de desverminação")
                .MustAsync(AnimalSemProtocolo)
                .WithMessage("Este animal já possui um protocolo de desverminação ativo.");

            RuleFor(x => x.DataEntrada)
                .NotEqual(default(DateTime))
                .WithMessage("Data de entrada é obrigatória.");
        }

        private async Task<bool> AnimalSemProtocolo(int animalId, CancellationToken cancellationToken)
        {
            var protocolo = await _protocoloRepository.GetProtocoloByAnimalAsync(animalId);
            return protocolo == null;
        }
    }
}
