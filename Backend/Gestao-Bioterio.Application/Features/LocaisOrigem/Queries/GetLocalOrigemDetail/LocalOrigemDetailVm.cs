namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Queries.GetLocalOrigemDetail
{
    public class LocalOrigemDetailVm
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}
