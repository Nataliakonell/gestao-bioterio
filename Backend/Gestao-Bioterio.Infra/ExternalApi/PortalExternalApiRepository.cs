using Gestao_Bioterio.Application.Contracts.Infrastructure;
using Gestao_Bioterio.Application.Models;
using Gestao_Bioterio.Infra.ExternalApi.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Gestao_Bioterio.Infra.ExternalApi
{
    public class PortalExternalApiRepository : IPortalExternalApiRepository
    {
        private readonly HttpClient _httpClient;
        private readonly IOptions<PortalExternalApiInformation> _externalApi;
        private readonly IOptions<LoginTokenInformation> _loginToken;

        public PortalExternalApiRepository(
            HttpClient httpClient,
            IOptions<PortalExternalApiInformation> externalInfo, 
            IOptions<LoginTokenInformation> loginToken)
        {
            _externalApi = externalInfo;
            _loginToken = loginToken;
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri($"{_externalApi?.Value?.BaseUrl?.TrimEnd('/')}/");
        }

        private async Task<string> GetTokenAsync(CancellationToken cancellationToken)
        {
            var requestData = new Dictionary<string, string>
            {
                { "grant_type", _loginToken.Value.GrantType! },
                { "client_id", _loginToken.Value.ClientId! },
                { "client_secret", _loginToken.Value.ClientSecret! }
            };

            var content = new FormUrlEncodedContent(requestData);

            var response = await _httpClient.PostAsync($"{_loginToken.Value.BaseUrl?.TrimEnd('/')}/realms/{_loginToken.Value.Realm}/protocol/openid-connect/token", content, cancellationToken);

            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

            var tokenData = JsonSerializer.Deserialize<ApiTokenResponse>(responseBody);
            if (tokenData == null || string.IsNullOrEmpty(tokenData.AccessToken))
                throw new ApplicationException("Erro ao obter o token de autenticação.");

            return tokenData.AccessToken;
        }

        public async Task UploadArquivoAsync(string NumeroRegistro, IFormFile arquivo, CancellationToken cancellationToken = default)
        {
            var token = await GetTokenAsync(cancellationToken);
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            if (string.IsNullOrWhiteSpace(NumeroRegistro))
                throw new ArgumentException("O numero de registro deve ser informado.", nameof(NumeroRegistro));

            var path = $"{_externalApi?.Value?.UploadPath?.TrimEnd('\\')}\\{NumeroRegistro}";

            if (arquivo == null || arquivo.Length == 0)
                throw new ArgumentNullException(nameof(arquivo), "O arquivo não pode ser nulo ou vazio.");

            using var multipart = new MultipartFormDataContent();
            multipart.Add(new StringContent(path), "path");

            using var arquivoContent = new StreamContent(arquivo.OpenReadStream());
            arquivoContent.Headers.ContentType = new MediaTypeHeaderValue(
                string.IsNullOrWhiteSpace(arquivo.ContentType) ? "application/octet-stream" : arquivo.ContentType);

            multipart.Add(arquivoContent, "file", Path.GetFileName(arquivo.FileName));

            using var request = new HttpRequestMessage(HttpMethod.Post, "crmintegration/UploadFiles")
            {
                Content = multipart
            };

            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            using var response = await _httpClient.SendAsync(request, cancellationToken);

            if (response.IsSuccessStatusCode)
                return;

            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            throw new HttpRequestException($"Falha ao enviar arquivos para a PortalAPI. StatusCode: {(int)response.StatusCode}. Resposta: {responseContent}");
        }

        public async Task<bool> ArquivosExist(string numeroRegistro, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(numeroRegistro))
                throw new ArgumentException("O número de registro deve ser informado.", nameof(numeroRegistro));

            var uploadPath = _externalApi.Value.UploadPath;

            if (string.IsNullOrWhiteSpace(uploadPath))
                throw new InvalidOperationException("O caminho de upload da PortalAPI não foi configurado.");

            var token = await GetTokenAsync(cancellationToken);
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var path = Path.Combine(uploadPath, numeroRegistro);

            var endpoint = $"api/crmintegration/FilesExist?path={Uri.EscapeDataString(path)}";

            using var response = await _httpClient.GetAsync(endpoint, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                var result = JsonSerializer.Deserialize<FilesExistResponse>(body);
                if (result == null)
                    throw new HttpRequestException("A PortalAPI retornou uma resposta vazia ao validar os arquivos.");

                return result.FilesExist;
            }

            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            throw new HttpRequestException($"Falha ao validar os arquivos na PortalAPI. StatusCode: {(int)response.StatusCode}. Resposta: {responseContent}");
        }
    }
}
