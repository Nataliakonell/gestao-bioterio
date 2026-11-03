using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class InstalacaoBioterioConfiguration : IEntityTypeConfiguration<InstalacaoBioterio>
    {
        public void Configure(EntityTypeBuilder<InstalacaoBioterio> builder)
        {
            builder.HasKey(i => i.Id);

            builder.Property(c => c.Nome)
             .IsRequired()
             .HasMaxLength(200);

            builder.HasMany(l => l.Animais)
                .WithOne(a => a.InstalacaoBioterio)
                .HasForeignKey(a => a.InstalacaoBioterioId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
