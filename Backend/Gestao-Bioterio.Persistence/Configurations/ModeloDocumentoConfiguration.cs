using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class ModeloDocumentoConfiguration : IEntityTypeConfiguration<ModeloDocumento>
    {
        public void Configure(EntityTypeBuilder<ModeloDocumento> builder)
        {
            builder.ToTable("ModelosDocumento");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.Nome)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.TipoSecao)
                .IsRequired();

            builder.Property(x => x.TipoDocumento)
                .IsRequired();

            builder.Property(x => x.Conteudo)
                .IsRequired(false);

            builder.Property(x => x.ConfiguracaoLayoutJson)
                .IsRequired(false);

            builder.Property(x => x.Ativo)
                .IsRequired();

            builder.HasOne(x => x.HeaderTemplate)
                .WithMany()
                .HasForeignKey(x => x.HeaderTemplateId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.FooterTemplate)
                .WithMany()
                .HasForeignKey(x => x.FooterTemplateId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
