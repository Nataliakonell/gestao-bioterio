namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetMyPermissoes
{
    public class MyPermissoesVm
    {
        public bool IsAdmin { get; set; }
        public bool Status { get; set; } = true;
        public List<FuncionalidadePermissaoDto> Permissoes { get; set; } = new();
    }

    public class FuncionalidadePermissaoDto
    {
        public string Funcionalidade { get; set; } = string.Empty;
        public string NivelAcesso { get; set; } = string.Empty;
    }
}
