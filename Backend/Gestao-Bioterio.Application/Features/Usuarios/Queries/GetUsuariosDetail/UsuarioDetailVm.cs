namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetUsuariosDetail
{
    public class UsuarioDetailVm
    {
        public int Id { get; set; }
        public string RF { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool Status { get; set; } = true;
        public int PerfilId { get; set; }
    }
}
