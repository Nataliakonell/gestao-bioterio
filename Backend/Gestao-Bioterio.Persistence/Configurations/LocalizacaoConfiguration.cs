using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class LocalizacaoConfiguration : IEntityTypeConfiguration<Localizacao>
    {
        public void Configure(
            EntityTypeBuilder<Localizacao> builder)
        {
            builder.ToTable("Localizacao");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Nome)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Ambiente)
                .IsRequired()
                .HasConversion<string>();

            builder.HasOne(x => x.LocalizacaoPai)
                .WithMany(x => x.SubLocalizacoes)
                .HasForeignKey(x => x.LocalizacaoPaiId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.CaminhoIds)
                .HasMaxLength(1000);

            builder.Property(x => x.CaminhoHierarquia);
        }
    }
}