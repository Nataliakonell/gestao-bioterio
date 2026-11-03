using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class RefeicaoConfiguration : IEntityTypeConfiguration<Refeicao>
    {
        public void Configure(EntityTypeBuilder<Refeicao> builder)
        {
            builder.HasKey(d => d.Id);

            builder.Property(d => d.TipoRefeicao)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(100);

            builder.Property(d => d.PesoRefeicao)
                .HasColumnType("decimal(18,2)");

            builder.Property(d => d.SituacaoRefeicao)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(d => d.UnidadeDeMedida)
                .HasMaxLength(20)
                .HasDefaultValue("g");
        }
    }
}
