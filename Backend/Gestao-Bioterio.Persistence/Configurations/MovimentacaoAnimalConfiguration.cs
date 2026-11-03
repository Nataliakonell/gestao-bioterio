
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class MovimentacaoAnimalConfiguration : IEntityTypeConfiguration<MovimentacaoAnimal>
    {
        public void Configure(
            EntityTypeBuilder<MovimentacaoAnimal> builder)
        {
            builder.ToTable("MovimentacaoAnimal");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.AnimalId)
                .IsRequired();

            builder.Property(x => x.LocalizacaoId)
                .IsRequired();


            builder.Property(x => x.EventoId);

            builder.Property(x => x.TipoMovimentacao)
                .IsRequired();

            builder.HasOne<Animal>()
                .WithMany()
                .HasForeignKey(x => x.AnimalId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Localizacao>()
                .WithMany()
                .HasForeignKey(x => x.LocalizacaoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
