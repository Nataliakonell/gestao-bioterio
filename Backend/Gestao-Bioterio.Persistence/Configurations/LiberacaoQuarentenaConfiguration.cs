using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class LiberacaoQuarentenaConfiguration : IEntityTypeConfiguration<LiberacaoQuarentena>
    {
        public void Configure(EntityTypeBuilder<LiberacaoQuarentena> builder)
        {
            builder.ToTable("LiberacoesQuarentena");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.AnimalId)
                .IsRequired();

            builder.HasOne(x => x.Animal)
                .WithMany()
                .HasForeignKey(x => x.AnimalId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.DataEntradaQuarentena)
                .IsRequired();

            builder.Property(x => x.DataSaidaQuarentena)
                .IsRequired();

            builder.HasOne(x => x.InstalacaoBioterio)
                .WithMany()
                .HasForeignKey(x => x.InstalacaoBioterioId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.AnimalId);

            builder.Property(x => x.Responsavel)
                .IsRequired(false)
                .HasMaxLength(200);
        }
    }
}
