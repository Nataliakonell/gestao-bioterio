using Microsoft.AspNetCore.Http;

namespace Gestao_Bioterio.Application.Contracts.Infrastructure
{
    public interface IPortalExternalApiRepository
    {
        Task UploadArquivoAsync(string numeroRegistro, IFormFile arquivo, CancellationToken cancellationToken = default);
        Task<bool> ArquivosExist(string numeroRegistro, CancellationToken cancellationToken = default);
    }
}
