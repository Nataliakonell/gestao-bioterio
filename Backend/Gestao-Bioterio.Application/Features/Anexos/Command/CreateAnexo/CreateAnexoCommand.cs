using MediatR;

namespace Gestao_Bioterio.Application.Features.Anexos.Command.CreateAnexo
{
    public class CreateAnexoCommand : IRequest<CreateAnexoResponse>
    {
        public int AnimalId { get; set; }
        public string? NomeArquivoAnexo { get; set; }
        public string? Descricao { get; set; }
        public string? Responsavel { get; set; }
        public Microsoft.AspNetCore.Http.IFormFile? Arquivo { get; set; }
    }
}