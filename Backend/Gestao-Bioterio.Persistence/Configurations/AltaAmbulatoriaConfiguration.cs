using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class AltaAmbulatoriaConfiguration : IEntityTypeConfiguration<AltaAmbulatorial>
    {
        public void Configure(EntityTypeBuilder<AltaAmbulatorial> builder)
        {
            builder.ToTable("AltaAmbulatoriais");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.AnimalId)
                .IsRequired();

            builder.HasOne(x => x.Animal)
                .WithMany()
                .HasForeignKey(x => x.AnimalId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.DataEntradaAmbulatorio)
                .IsRequired(false);

            builder.Property(x => x.ProcedimentosMedicacoes)
                .IsRequired(false);

            builder.Property(x => x.ObservacoesClinicas)
                .IsRequired(false);

            builder.HasIndex(x => x.AnimalId);

            builder.HasOne(x => x.InstalacaoBioterioRetorno)
                .WithMany()
                .HasForeignKey(x => x.InstalacaoBioterioRetornoId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.Responsavel)
                .IsRequired(false)
                .HasMaxLength(200);
        }
    }
}
