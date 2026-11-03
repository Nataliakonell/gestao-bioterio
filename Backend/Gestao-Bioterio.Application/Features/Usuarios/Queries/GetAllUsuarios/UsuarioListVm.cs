namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetAllUsuarios
{
    public class UsuarioListVm
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool Status { get; set; } = true;
        public int PerfilId { get; set; }
        public string RF { get; set; } = string.Empty;
    }
}
