using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class TipoProcedimentoConfiguration : IEntityTypeConfiguration<TipoProcedimento>
    {
        public void Configure(EntityTypeBuilder<TipoProcedimento> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Nome)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Ativo)
                .IsRequired();

            builder.HasIndex(x => x.Nome).IsUnique();
        }
    }
}
