using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class Usuario : AuditableEntity
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool Status { get; set; } = true;
        
        public int PerfilId { get; set; }
        public Perfil Perfil { get; set; } = null!;
    }
}
