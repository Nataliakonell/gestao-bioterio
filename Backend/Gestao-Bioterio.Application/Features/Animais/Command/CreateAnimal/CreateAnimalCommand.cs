using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Gestao_Bioterio.Application.Features.Animais.Command.CreateAnimal
{
    public class CreateAnimalCommand : IRequest<CreateAnimalResponse>
    {
        public int EspecieId { get; set; }
        public string NumeroRegistro { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;


        public int InstalacaoBioterioId { get; set; }
        public int? LocalizacaoId { get; set; }

        public DateTime DataDeEntrada { get; set; } 
        public FaseDeVida FaseDeVida { get; set; }
        public Genero Genero { get; set; }

        public string Municipio { get; set; } = string.Empty;
        public string NumeroChip { get; set; } = string.Empty;

        public bool Sisfauna { get; set; }
        public bool TermoDeDoacao { get; set; }
        public Situacao SituacaoAnimal { get; set; }
        public decimal Peso { get; set; }
        public decimal? Comprimento { get; set; }
        public decimal? ComprimentoCauda { get; set; }
        public int LocalOrigemId { get; set; }
        public IFormFile? FotoAnimal { get; set; }

    }
}