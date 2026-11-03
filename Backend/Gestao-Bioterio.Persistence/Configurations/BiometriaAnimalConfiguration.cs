using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class BiometriaAnimalConfiguration : IEntityTypeConfiguration<BiometriaAnimal>
    {
        public void Configure(EntityTypeBuilder<BiometriaAnimal> builder)
        {
            builder.HasKey(b => b.Id);

            builder.Property(b => b.Peso)
                .HasColumnType("decimal(18,2)");

            builder.Property(b => b.Comprimento)
                .HasColumnType("decimal(18,2)");

            builder.Property(b => b.ComprimentoCauda)
                .HasColumnType("decimal(18,2)");

            builder.Property(b => b.DataBiometria)
                .IsRequired();

            builder.HasOne(b => b.Animal)
                .WithMany(a => a.BiometriaAnimais)
                .HasForeignKey(b => b.AnimalId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
