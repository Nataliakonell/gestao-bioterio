using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class PerfilPermissaoConfiguration : IEntityTypeConfiguration<PerfilPermissao>
    {
        public void Configure(EntityTypeBuilder<PerfilPermissao> builder)
        {
            builder.ToTable("PerfilPermissao");

            builder.HasKey(e => e.Id);

            builder.HasIndex(e => new { e.PerfilId, e.FuncionalidadeId })
                .IsUnique();

            builder.Property(e => e.NivelAcesso)
                .IsRequired()
                .HasConversion<int>();

            builder.HasOne(e => e.Perfil)
                .WithMany(p => p.PerfilPermissoes)
                .HasForeignKey(e => e.PerfilId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.Funcionalidade)
                .WithMany(f => f.PerfilPermissoes)
                .HasForeignKey(e => e.FuncionalidadeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
