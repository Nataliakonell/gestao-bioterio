namespace Gestao_Bioterio.Application.Features.Perfis.Queries.GetPerfilDetail
{
    public class PerfilDetailVm
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public List<PermissaoVm> Permissoes { get; set; } = new List<PermissaoVm>();
    }

    public class PermissaoVm
    {
        public int FuncionalidadeId { get; set; }
        public int NivelAcesso { get; set; }
    }
}
