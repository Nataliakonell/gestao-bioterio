using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class EspecieConfiguration : IEntityTypeConfiguration<Especie>
    {
        public void Configure(EntityTypeBuilder<Especie> builder)
        {
            builder.HasKey(i => i.Id);

            builder.Property(c => c.Nome)
             .IsRequired()
             .HasMaxLength(150);

            builder.HasMany(s => s.Animais)
                .WithOne(a => a.Especie)
                .HasForeignKey(a => a.EspecieId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.Grupo)
                .WithMany(g => g.Especies)
                .HasForeignKey(e => e.GrupoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
