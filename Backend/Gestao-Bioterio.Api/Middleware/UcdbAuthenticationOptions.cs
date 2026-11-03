namespace Gestao_Bioterio.Api.Middleware
{
    public class UcdbAuthenticationOptions
    {
        public string Authority { get; set; } = "https://accounts.ucdb.br";
        public string ClientId { get; set; } = string.Empty;
        public bool RequireHttpsMetadata { get; set; } = true;
        public TimeSpan TokenCacheExpiry { get; set; } = TimeSpan.FromMinutes(5);
    }
}
