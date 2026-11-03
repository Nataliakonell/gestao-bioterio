using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class DoseAplicacaoDesverminacaoConfiguration  : IEntityTypeConfiguration<DoseAplicacaoDesverminacao>
    {
        public void Configure(EntityTypeBuilder<DoseAplicacaoDesverminacao> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x =>x.ProtocoloDesverminacaoId)
                .IsRequired();  

            builder.Property(x => x.TipoDose)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.StatusDoseDesverminacao)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.Observacao);

            builder.Property(x => x.Responsavel)
                .IsRequired(false)
                .HasMaxLength(200);
        }
    }
}
