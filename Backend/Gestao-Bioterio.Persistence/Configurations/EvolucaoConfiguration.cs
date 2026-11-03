using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class EvolucaoConfiguration : IEntityTypeConfiguration<Evolucao>
    {
        public void Configure(EntityTypeBuilder<Evolucao> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.AnimalId)
                .IsRequired();

            builder.Property(e => e.Descricao)
                .HasMaxLength(4000);

            builder.Property(e => e.DataHoraRegistro)
                .IsRequired();

            builder.Property(e => e.Responsavel)
                .IsRequired()
                .HasMaxLength(200);

            builder.HasIndex(x => x.AnimalId);
            builder.HasIndex(x => x.DataHoraRegistro);
            builder.HasIndex(x => x.Responsavel);
        }
    }
}
