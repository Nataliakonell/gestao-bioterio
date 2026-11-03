namespace Gestao_Bioterio.Application.Contracts.Infrastructure
{
    public interface ICurrentUserService
    {
        string? GetRfFromToken();
        string? GetNomeFromToken();
        public bool IsAuthenticated => false;
    }
}
