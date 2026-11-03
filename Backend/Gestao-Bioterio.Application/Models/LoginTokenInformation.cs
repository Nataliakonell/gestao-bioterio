namespace Gestao_Bioterio.Application.Models
{
    public class LoginTokenInformation
    {
        public string? BaseUrl { get; set; }
        public string? GrantType { get; set; }
        public string? ClientId { get; set; }
        public string? ClientSecret { get; set; }
        public string? Realm { get; set; }
    }
}
