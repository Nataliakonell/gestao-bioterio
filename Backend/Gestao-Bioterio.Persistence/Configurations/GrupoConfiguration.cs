using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class GrupoConfiguration : IEntityTypeConfiguration<Grupo>
    {
        public void Configure(EntityTypeBuilder<Grupo> builder)
        {
            builder.HasKey(i => i.Id);

            builder.Property(c => c.Nome)
             .IsRequired()
             .HasMaxLength(150);

            builder.HasMany(g => g.Especies)
                .WithOne(a => a.Grupo)
                .HasForeignKey(a => a.GrupoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
