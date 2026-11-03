using System.Text.Json.Serialization;

namespace Gestao_Bioterio.Infra.ExternalApi.Responses
{
    public class ApiTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }
}
