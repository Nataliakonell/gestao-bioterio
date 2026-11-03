using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class MedicacaoConfiguration : IEntityTypeConfiguration<Medicacao>
    {
        public void Configure(EntityTypeBuilder<Medicacao> builder)
        {
            builder.HasKey(x => x.Id); 
            
            builder.Property(x => x.Id)
                .ValueGeneratedOnAdd();

            builder.Property(m => m.PrincipioAtivo)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(m => m.NomeComercial)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.Ativo)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasIndex(x => x.PrincipioAtivo);
        }
    }
}
