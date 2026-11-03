using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class AnimalLocalizacaoConfiguration : IEntityTypeConfiguration<AnimalLocalizacao>
    {
        public void Configure(
             EntityTypeBuilder<AnimalLocalizacao> builder)
        {
            builder.ToTable("AnimalLocalizacao");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.AnimalId)
                .IsRequired();

            builder.Property(x => x.LocalizacaoId)
                .IsRequired();

            builder.HasIndex(x => x.AnimalId)
                .IsUnique();

            builder.HasOne(x => x.Animal)
                .WithOne(a => a.AnimalLocalizacao)
                .HasForeignKey<AnimalLocalizacao>(x => x.AnimalId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Localizacao)
                .WithMany(x => x.AnimaisLocalizados)
                .HasForeignKey(x => x.LocalizacaoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
