using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class EventoAnimalConfiguration : IEntityTypeConfiguration <EventoAnimal>
    {
        public void Configure(EntityTypeBuilder<EventoAnimal> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(x => x.EventoId)
                .IsRequired();

            builder.Property(x => x.AnimalId)
                .IsRequired();

            builder.HasOne<Evento>()
                .WithMany()
                .HasForeignKey(x => x.EventoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Animal>()
                .WithMany()
                .HasForeignKey(x => x.AnimalId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.EventoId, x.AnimalId })
                .IsUnique();
        }
    }
}
