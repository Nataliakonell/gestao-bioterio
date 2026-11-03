using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class PerfilPermissao : AuditableEntity
    {
        public int Id { get; set; }
        public int PerfilId { get; set; }
        public int FuncionalidadeId { get; set; }
        public NivelAcesso NivelAcesso { get; set; }
        public Perfil Perfil { get; set; }
        public Funcionalidade Funcionalidade { get; set; }
    }
    public enum NivelAcesso
    {
        SemAcesso = 1, 
        Visualizar = 2, 
        Editar = 3,
        Gerenciar = 4
    }
}
