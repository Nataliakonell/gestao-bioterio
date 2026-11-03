using Azure.Storage.Blobs;
using Gestao_Bioterio.Application.Contracts.Infrastructure;

namespace Gestao_Bioterio.Infra.Blob
{
    public class BlobStorageService : IBlobStorageService
    {
        private readonly BlobConfiguration _blobConfiguration;

        private readonly BlobContainerClient _blobContainerClient;
        public BlobStorageService(BlobConfiguration blobConfiguration)
        {
            _blobConfiguration = blobConfiguration;
            var blobServiceClient = new BlobServiceClient(_blobConfiguration.ConnectionString);
            _blobContainerClient = blobServiceClient.GetBlobContainerClient(_blobConfiguration.ContainerName);
            _blobContainerClient.CreateIfNotExists();
        }

        public Task<byte[]> DownloadFileAsync(string fileName)
        {
            var blobClient = _blobContainerClient.GetBlobClient(fileName);
            var downloadInfo = blobClient.DownloadContent();
            return Task.FromResult(downloadInfo.Value.Content.ToArray());
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName)
        {
            var blobClient = _blobContainerClient.GetBlobClient(fileName);
            await blobClient.UploadAsync(fileStream, overwrite: true);
            return blobClient.Uri.ToString();
        }

        public async Task DeleteFileAsync(string fileName)
        {
            var blobClient = _blobContainerClient.GetBlobClient(fileName);
            await blobClient.DeleteIfExistsAsync();
        }
    }
}
