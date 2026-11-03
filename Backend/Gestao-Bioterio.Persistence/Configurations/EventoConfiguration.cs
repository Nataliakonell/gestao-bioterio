using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class EventoConfiguration
        : IEntityTypeConfiguration<Evento>
    {
        public void Configure(EntityTypeBuilder<Evento> builder)
        {
            builder.ToTable("Evento");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Nome)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.TipoEvento)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.DataHoraInicio)
                .IsRequired();

            builder.Property(x => x.DataHoraPrevisaoRetorno)
                .IsRequired();

            builder.Property(x => x.Responsavel)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);
        }
    }
}
