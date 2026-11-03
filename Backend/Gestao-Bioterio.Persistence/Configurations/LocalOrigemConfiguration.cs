using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class LocalOrigemConfiguration : IEntityTypeConfiguration<LocalOrigem>
    {
        public void Configure(EntityTypeBuilder<LocalOrigem> builder)
        {
            builder.HasKey(i => i.Id);

            builder.Property(c => c.Nome)
                .IsRequired()
                .HasMaxLength(150);

            builder.HasIndex(u => u.Nome).IsUnique();

            builder.HasMany(s => s.Animais)
                .WithOne(a => a.LocalOrigem)
                .HasForeignKey(a => a.LocalOrigemId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
