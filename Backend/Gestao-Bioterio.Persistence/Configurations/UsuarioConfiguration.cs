using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
    {
        public void Configure(EntityTypeBuilder<Usuario> builder)
        {
            builder.HasKey(u => u.Id);

            builder.Property(u => u.RF)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(u => u.RF)
                .IsUnique()
                .HasDatabaseName("IX_Usuario_RF");

            builder.Property(u => u.Nome)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(150);

            builder.HasIndex(u => u.Email)
                .IsUnique()
                .HasDatabaseName("IX_Usuario_Email");

            builder.Property(u => u.Status)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasOne(u => u.Perfil)
                .WithMany(p => p.Usuarios)
                .HasForeignKey(u => u.PerfilId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
