using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class PerfilPermissaoLogConfiguration : IEntityTypeConfiguration<PerfilPermissaoLog>
    {
        public void Configure(EntityTypeBuilder<PerfilPermissaoLog> builder)
        {
            builder.ToTable("PerfilPermissaoLog");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.TipoOperacao)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(e => e.NivelAcesso)
                .IsRequired()
                .HasConversion<int>();
        }
    }
}
