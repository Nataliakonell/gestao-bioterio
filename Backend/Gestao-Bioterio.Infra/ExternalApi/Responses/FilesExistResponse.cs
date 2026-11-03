using System.Text.Json.Serialization;

namespace Gestao_Bioterio.Infra.ExternalApi.Responses
{
    public class FilesExistResponse
    {
        [JsonPropertyName("filesExist")]
        public bool FilesExist { get; set; }
    }
}
