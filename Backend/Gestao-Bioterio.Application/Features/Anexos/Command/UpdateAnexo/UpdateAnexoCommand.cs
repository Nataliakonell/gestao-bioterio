using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Anexos.Command.UpdateAnexo
{
    public class UpdateAnexoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string? NomeArquivoAnexo { get; set; }
        public string? Descricao { get; set; }
        public string? Responsavel { get; set; }
    }
}