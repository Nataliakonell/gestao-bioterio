using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class PerfilConfiguration : IEntityTypeConfiguration<Perfil>
    {
        public void Configure(EntityTypeBuilder<Perfil> builder)
        {
            builder.ToTable("Perfis");
            builder.HasKey(e => e.Id);
            
            builder.Property(e => e.Nome)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(e => e.Descricao)
                .IsRequired()
                .HasMaxLength(200);
        }
    }
}
