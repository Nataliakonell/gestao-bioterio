using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class MedicacaoAdministradaConfiguration : IEntityTypeConfiguration <MedicacaoAdministrada>
    {
        public void Configure(EntityTypeBuilder<MedicacaoAdministrada> builder)
        {
            builder.HasKey(x => x.Id); 
            builder.Property(x => x.Id)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.PrescricaoMedicacaoId)
                .IsRequired();

            builder.Property(x => x.DataHoraPrevista)
                .IsRequired();

            builder.Property(x => x.DataHoraAdministracao)
                .IsRequired(false);

            builder.Property(x => x.Observacao)
                .IsRequired(false)
                .HasMaxLength(1000);

            builder.Property(x => x.Responsavel)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.StatusDose)
                .IsRequired()
                .HasConversion<string>();

            builder.HasIndex(x => x.PrescricaoMedicacaoId); 
            builder.HasIndex(x => x.DataHoraPrevista); 
            builder.HasIndex(x => x.StatusDose);
        }

    }
}
