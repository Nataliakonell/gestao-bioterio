using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class SolicitacaoExameConfiguration : IEntityTypeConfiguration<SolicitacaoExame>
    {
        public void Configure(EntityTypeBuilder<SolicitacaoExame> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.AnimalId)
                .IsRequired();

            builder.Property(x => x.SinaisClinicos)
                .IsRequired(false)
                .HasMaxLength(2000);

            builder.Property(x => x.SuspeitaClinica)
                .IsRequired(false)
                .HasMaxLength(2000);

            builder.Property(x => x.RegiaoAnatomica)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(x => x.Observacao)
                .HasMaxLength(2000);

            builder.Property(x => x.TipoExame)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20)
                .HasDefaultValue(StatusSolicitacaoExame.Ativa);

            builder.Property(x => x.MotivoSuspensao)
                .IsRequired(false)
                .HasMaxLength(1000);

            builder.HasIndex(x => x.AnimalId);
            builder.HasIndex(x => x.TipoExame);
            builder.HasIndex(x => x.Status);

            builder.Property(x => x.Responsavel)
                .IsRequired(false)
                .HasMaxLength(200);
        }
    }
}
