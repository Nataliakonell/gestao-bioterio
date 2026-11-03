using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class DocumentoEventoConfiguration : IEntityTypeConfiguration<DocumentoEvento>
    {
        public void Configure (EntityTypeBuilder<DocumentoEvento> builder)
        {
            builder.ToTable("DocumentoEvento");

            builder.HasKey(d => d.Id);

            builder.Property(d => d.EventoId)
                .IsRequired();

            builder.Property(x => x.ModeloDocumentoId)
                .IsRequired();

            builder.Property(x => x.ConteudoDadosJson)
                .IsRequired()
                .HasColumnType("nvarchar(max)");

            builder.HasOne<Evento>()
                .WithMany()
                .HasForeignKey(e => e.EventoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ModeloDocumento>()
                .WithMany()
                .HasForeignKey(x => x.ModeloDocumentoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
