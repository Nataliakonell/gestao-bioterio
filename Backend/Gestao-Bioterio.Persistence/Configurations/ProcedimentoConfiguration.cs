using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class ProcedimentoConfiguration : IEntityTypeConfiguration<Procedimento>
    {
        public void Configure(EntityTypeBuilder<Procedimento> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.AnimalId)
                .IsRequired();

            builder.Property(x => x.TipoProcedimentoId)
                .IsRequired();

            builder.Property(x => x.Descricao)
               .HasMaxLength(2000)
               .IsRequired(false);

            builder.HasIndex(x => x.TipoProcedimentoId);
            builder.HasIndex(x => x.AnimalId);
            
            builder.HasOne(x => x.TipoProcedimento)
                .WithMany()
                .HasForeignKey(x => x.TipoProcedimentoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.Responsavel)
                .HasMaxLength(200);
        }
    }
}
