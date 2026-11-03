using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Gestao_Bioterio.Application.Features.Animais.Command.UpdateAnimal
{
    public class UpdateAnimalCommand : IRequest<UpdateAnimalResponse>
    {
        public int Id { get; set; }
        public string NumeroRegistro { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;

        public int? EspecieId { get; set; }
        public Especie? Especie { get; set; }

        public int? InstalacaoBioterioId { get; set; }
        public InstalacaoBioterio? InstalacaoBioterio { get; set; }

        public int? LocalizacaoId { get; set; }

        public DateTime? DataDeEntrada { get; set; }
        public FaseDeVida? FaseDeVida { get; set; }
        public Genero? Genero { get; set; }

        public string? Municipio { get; set; }
        public string? NumeroChip { get; set; }

        public decimal? Peso { get; set; }
        public decimal? Comprimento { get; set; }
        public decimal? ComprimentoCauda { get; set; }

        public bool? Sisfauna { get; set; }
        public bool? TermoDeDoacao { get; set; }
        public Situacao? SituacaoAnimal { get; set; }

        public int? LocalOrigemId { get; set; }
        public LocalOrigem? LocalOrigem { get; set; }
        public IFormFile? FotoAnimal { get; set; }
    }
}
