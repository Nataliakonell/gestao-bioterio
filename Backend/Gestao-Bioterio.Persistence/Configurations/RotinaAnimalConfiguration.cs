using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class RotinaAnimalConfiguration : IEntityTypeConfiguration<RotinaAnimal>
    {
        public void Configure(EntityTypeBuilder<RotinaAnimal> builder)
        {
            builder.ToTable("RotinasAnimais");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.TipoRotina)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(e => e.FaseDeVida)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(e => e.TipoFrequencia)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(e => e.Frequencia);

            builder.Property(e => e.DiaSemanaProgramado)
                .HasConversion(
                    v => v == null ? null : System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => v == null ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null))
                .HasMaxLength(100);

            builder.Property(e => e.DiaSemanaProgramado)
                .Metadata.SetValueComparer(new ValueComparer<List<string>>(
                    (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                    c => c != null ? c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())) : 0,
                    c => c != null ? c.ToList() : null));

            builder.Property(e => e.ProtocoloDieta)
                .HasMaxLength(1000);

            builder.HasOne(e => e.Especie)
                .WithMany()
                .HasForeignKey(e => e.EspecieId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(e => new { e.EspecieId, e.TipoRotina, e.FaseDeVida })
                .IsUnique();
        }
    }
}
