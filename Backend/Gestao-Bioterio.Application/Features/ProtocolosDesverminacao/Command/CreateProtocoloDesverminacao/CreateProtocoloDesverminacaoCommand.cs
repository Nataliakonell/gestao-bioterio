using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.CreateProtocoloDesverminacao
{
    public class CreateProtocoloDesverminacaoCommand : IRequest<CreateProtocoloDesverminacaoResponse>
    {
        public int AnimalId { get; set; }
        public DateTime DataEntrada { get; set; }
        /// <summary>
        /// Indica que o animal já possui histórico de doses anteriores ao cadastro neste sistema.
        /// Quando true, não agenda automaticamente a 1ª dose pois o frontend registrará a dose correta.
        /// </summary>
        public bool TemHistoricoDoses { get; set; } = false;
    }
}