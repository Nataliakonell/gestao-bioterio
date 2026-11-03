using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Infrastructure;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Gestao_Bioterio.Application.Features.Animais.Command.UpdateAnimal
{
    public class UpdateAnimalHandler(
        IAnimalRepository animalRepository,
        IMapper mapper,
        IValidator<UpdateAnimalCommand> validator,
        IBlobStorageService blobStorageService,
        IBiometriaAnimalRepository biometriaAnimalRepository,
        IAnimalLocalizacaoRepository animalLocalizacaoRepository,
        IMovimentacaoAnimalRepository movimentacaoAnimalRepository
    ) : IRequestHandler<UpdateAnimalCommand, UpdateAnimalResponse>
    {
        public async Task<UpdateAnimalResponse> Handle(UpdateAnimalCommand command, CancellationToken cancellationToken)
        {
            var response = new UpdateAnimalResponse();
            response.Id = command.Id;

            var animalToUpdate = await animalRepository.GetAnimalWithDetailsAsync(command.Id);

            if (animalToUpdate == null)
                throw new NotFoundException(nameof(Animal), command.Id);

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                response.Message = "Erro na validação da atualização do animal.";
                return response;
            }

            var dadosAntigos = mapper.Map<Animal>(animalToUpdate);

            if (command.NumeroRegistro != null)
                animalToUpdate.NumeroRegistro = command.NumeroRegistro;

            if (command.NomePopular != null)
                animalToUpdate.NomePopular = command.NomePopular;

            if (command.Municipio != null)
                animalToUpdate.Municipio = command.Municipio;

            if (command.DataDeEntrada.HasValue)
                animalToUpdate.DataDeEntrada = command.DataDeEntrada.Value;

            if (command.FaseDeVida.HasValue)
                animalToUpdate.FaseDeVida = command.FaseDeVida.Value;

            if (command.NumeroChip != null)
                animalToUpdate.NumeroChip = command.NumeroChip;

            if (command.Genero.HasValue)
                animalToUpdate.Genero = command.Genero.Value;

            if (command.Sisfauna.HasValue)
                animalToUpdate.Sisfauna = command.Sisfauna.Value;

            if (command.TermoDeDoacao.HasValue)
                animalToUpdate.TermoDeDoacao = command.TermoDeDoacao.Value;

            if (command.SituacaoAnimal.HasValue)
            {
                animalToUpdate.SituacaoAnimal = command.SituacaoAnimal.Value;
            }

            if (command.EspecieId.HasValue && command.EspecieId.Value > 0)
                animalToUpdate.EspecieId = command.EspecieId.Value;

            if (command.InstalacaoBioterioId.HasValue && command.InstalacaoBioterioId.Value > 0)
                animalToUpdate.InstalacaoBioterioId = command.InstalacaoBioterioId.Value;

            if (command.LocalizacaoId.HasValue && command.LocalizacaoId.Value > 0)
            {
                var localizacaoAtual = await animalLocalizacaoRepository.ObterPorAnimalIdAsync(animalToUpdate.Id);
                if (localizacaoAtual == null)
                {
                    await animalLocalizacaoRepository.AddAsync(new AnimalLocalizacao
                    {
                        AnimalId = animalToUpdate.Id,
                        LocalizacaoId = command.LocalizacaoId.Value
                    });

                    await movimentacaoAnimalRepository.AddAsync(new MovimentacaoAnimal
                    {
                        AnimalId = animalToUpdate.Id,
                        LocalizacaoId = command.LocalizacaoId.Value,
                        TipoMovimentacao = TipoMovimentacao.Transferencia
                    });
                }
                else if (localizacaoAtual.LocalizacaoId != command.LocalizacaoId.Value)
                {
                    localizacaoAtual.LocalizacaoId = command.LocalizacaoId.Value;
                    await animalLocalizacaoRepository.UpdateAsync(localizacaoAtual);

                    await movimentacaoAnimalRepository.AddAsync(new MovimentacaoAnimal
                    {
                        AnimalId = animalToUpdate.Id,
                        LocalizacaoId = command.LocalizacaoId.Value,
                        TipoMovimentacao = TipoMovimentacao.Transferencia
                    });
                }
            }


            if (command.LocalOrigemId.HasValue && command.LocalOrigemId.Value > 0)
                animalToUpdate.LocalOrigemId = command.LocalOrigemId.Value;

            if(command.FotoAnimal != null)
            {
                if (!string.IsNullOrEmpty(animalToUpdate.NomeArquivoFoto))
                    await blobStorageService.DeleteFileAsync(animalToUpdate.NomeArquivoFoto);
                
                animalToUpdate.NomeArquivoFoto = await UploadImagemAsync(command.FotoAnimal);
            }

            var biometrias = await biometriaAnimalRepository.GetBiometriaAsync(animalToUpdate.Id);
            var ultimaBiometria = biometrias.OrderByDescending(b => b.Id).FirstOrDefault();

            if (ultimaBiometria != null)
            {
                bool biometriaChanged = false;
                if (command.Peso.HasValue && ultimaBiometria.Peso != command.Peso.Value) biometriaChanged = true;
                if (command.Comprimento.HasValue && ultimaBiometria.Comprimento != command.Comprimento.Value) biometriaChanged = true;
                if (command.ComprimentoCauda.HasValue && ultimaBiometria.ComprimentoCauda != command.ComprimentoCauda.Value) biometriaChanged = true;

                if (biometriaChanged)
                {
                    var novaBiometria = new BiometriaAnimal
                    {
                        AnimalId = animalToUpdate.Id,
                        Peso = command.Peso ?? ultimaBiometria.Peso,
                        Comprimento = command.Comprimento ?? ultimaBiometria.Comprimento,
                        ComprimentoCauda = command.ComprimentoCauda ?? ultimaBiometria.ComprimentoCauda,
                        DataBiometria = animalToUpdate.DataDeEntrada
                    };
                    
                    await biometriaAnimalRepository.AddAsync(novaBiometria);
                }
            }

            var animalAtualizado = await animalRepository.UpdateAsync(animalToUpdate);

            response.Id = animalAtualizado.Id;
            response.Animal = mapper.Map<RotinaAnimalDetailVm>(animalAtualizado);
            response.Message = "Animal atualizado com sucesso";
            response.Success = true;

            return response;
        }
        private async Task<string> UploadImagemAsync(IFormFile file)
        {
            var bytes = Guid.NewGuid().ToByteArray();
            var s = Convert.ToBase64String(bytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
            var fileName = $"{s}{Path.GetExtension(file.FileName)}";
            using var stream = file.OpenReadStream();

            await blobStorageService.UploadFileAsync(stream, fileName);
            return fileName;
        }
    }
}
