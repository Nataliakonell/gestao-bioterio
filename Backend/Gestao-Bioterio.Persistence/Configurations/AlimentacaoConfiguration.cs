using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class AlimentacaoConfiguration : IEntityTypeConfiguration<Alimentacao>
    {
        public void Configure(EntityTypeBuilder<Alimentacao> builder)
        {
            builder.ToTable("Alimentacoes", "bioterio");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.PesoRecomendado)
                .HasColumnType("decimal(18,2)");

            builder.Property(a => a.TotalOfertado)
                .HasColumnType("decimal(18,2)");

            builder.Property(a => a.TotalConsumido)
                .HasColumnType("decimal(18,2)");

            builder.Property(a => a.Saldo)
                .HasColumnType("decimal(18,2)");

            builder.Property(a => a.PorcentagemPesoRecomendado)
                .HasColumnType("decimal(5,2)");

            builder.Property(a => a.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);


            builder.HasOne(a => a.Animal)
                .WithMany()
                .HasForeignKey(a => a.AnimalId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(a => a.BiometriaAnimal)
                .WithMany()
                .HasForeignKey(a => a.BiometriaAnimalId)
                .OnDelete(DeleteBehavior.NoAction)
                .IsRequired(false); 
        }
    }
}
