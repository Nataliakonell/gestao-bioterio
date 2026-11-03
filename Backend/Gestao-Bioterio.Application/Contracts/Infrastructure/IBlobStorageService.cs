namespace Gestao_Bioterio.Application.Contracts.Infrastructure
{
    public interface IBlobStorageService
    {
        Task<string> UploadFileAsync(Stream fileStream, string fileName);
        Task<byte[]> DownloadFileAsync(string fileName);
        Task DeleteFileAsync(string fileName);
    }
}
