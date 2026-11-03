using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class AnimalLogConfiguration : IEntityTypeConfiguration<AnimalLog>
    {
        public void Configure(EntityTypeBuilder<AnimalLog> builder)
        {
            builder.HasKey(l => l.Id);

            builder.Property(l => l.NumeroRegistro)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(l => l.NomePopular)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(l => l.Municipio)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(l => l.Genero)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(l => l.FaseDeVida)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(l => l.NumeroChip)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(l => l.RF)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(l => l.TipoOperacao)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("CREATE");

            builder.Property(l => l.DataCriacao)
                .IsRequired();

            builder.Property(l => l.DataAtualizacao)
                .IsRequired();

            builder.HasOne(l => l.Animal)
                .WithMany()
                .HasForeignKey(l => l.AnimalId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            builder.HasIndex(l => l.AnimalId);

            builder.HasIndex(l => new { l.AnimalId, l.DataCriacao });
        }
    }
}
