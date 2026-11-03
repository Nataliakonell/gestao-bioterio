using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class AnexoConfiguration : IEntityTypeConfiguration<Anexo>
    {
        public void Configure(EntityTypeBuilder<Anexo> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.AnimalId)
                .IsRequired();

            builder.Property(e => e.NomeArquivoAnexo)
                .HasMaxLength(200);

            builder.Property(e => e.Descricao)
                .HasMaxLength(2000);

            builder.HasIndex(e => e.AnimalId);

            builder.Property(e => e.Responsavel)
                .IsRequired(false)
                .HasMaxLength(200);
        }
    }
}
