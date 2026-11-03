using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Command.CreateDocumentoEvento
{
    public class CreateDocumentoEventoValidator : AbstractValidator<CreateDocumentoEventoCommand>
    {
        private readonly IEventoRepository _eventoRepository;
        private readonly IModeloDocumentoRepository _modeloDocumentoRepository;

        public CreateDocumentoEventoValidator(
            IEventoRepository eventoRepository,
            IModeloDocumentoRepository modeloDocumentoRepository)
        {
            _eventoRepository = eventoRepository;
            _modeloDocumentoRepository = modeloDocumentoRepository;

            RuleFor(p => p.EventoId)
                .GreaterThan(0).WithMessage("O identificador do evento é obrigatório.")
                .MustAsync(async (eventoId, ct) =>
                {
                    var evento = await _eventoRepository.GetByIdAsync(eventoId);
                    return evento != null;
                })
                .WithMessage("O evento informado não existe.");

            RuleFor(p => p.ModeloDocumentoId)
                .GreaterThan(0).WithMessage("O identificador do modelo de documento é obrigatório.")
                .MustAsync(async (modeloId, ct) =>
                {
                    var modelo = await _modeloDocumentoRepository.GetByIdAsync(modeloId);
                    return modelo != null;
                })
                .WithMessage("O modelo de documento informado não existe.");

            RuleFor(p => p.ConteudoDadosJson)
                .NotEmpty().WithMessage("O conteúdo dos dados do documento é obrigatório.");
        }
    }
}
