using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Infrastructure;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Gestao_Bioterio.Application.Features.Animais.Command.CreateAnimal
{
    public class CreateAnimalCommandHandler(
        IMapper mapper,
        IAnimalRepository animalRepository,
        IBiometriaAnimalRepository biometriaAnimalRepository,
        IValidator<CreateAnimalCommand> validator,
        IBlobStorageService blobStorageService,
        IAnimalLocalizacaoRepository animalLocalizacaoRepository,
        IMovimentacaoAnimalRepository movimentacaoAnimalRepository,
        IInstalacaoBioterioRepository instalacaoBioterioRepository
    ) : IRequestHandler<CreateAnimalCommand, CreateAnimalResponse>
    {
        public async Task<CreateAnimalResponse> Handle(CreateAnimalCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateAnimalResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = new List<string>();
                foreach (var error in validationResult.Errors)
                {
                    response.ValidationErrors.Add(error.ErrorMessage);
                }
                response.Message = "Erro na validação do animal.";
                return response;
            }
            var animal = mapper.Map<Animal>(command);
            animal.SituacaoAnimal = command.SituacaoAnimal;

            // Se InstalacaoBioterioId não foi fornecido mas temos LocalizacaoId, definimos um fallback válido para satisfazer a FK legada do banco
            if (animal.InstalacaoBioterioId <= 0)
            {
                var instalacaoFallback = (await instalacaoBioterioRepository.ListAllAsync()).FirstOrDefault();
                if (instalacaoFallback != null)
                {
                    animal.InstalacaoBioterioId = instalacaoFallback.Id;
                }
            }

            if(command.FotoAnimal != null)
                animal.NomeArquivoFoto = await UploadImagemAsync(command.FotoAnimal);

            var savedAnimal = await animalRepository.AddAsync(animal);

            // Vincula o animal à nova Localizacao se informado
            if (command.LocalizacaoId.HasValue && command.LocalizacaoId.Value > 0)
            {
                await animalLocalizacaoRepository.AddAsync(new AnimalLocalizacao
                {
                    AnimalId = savedAnimal.Id,
                    LocalizacaoId = command.LocalizacaoId.Value
                });

                await movimentacaoAnimalRepository.AddAsync(new MovimentacaoAnimal
                {
                    AnimalId = savedAnimal.Id,
                    LocalizacaoId = command.LocalizacaoId.Value,
                    TipoMovimentacao = TipoMovimentacao.Transferencia
                });
            }

            var biometria = new BiometriaAnimal
            {
                AnimalId = savedAnimal.Id,
                Peso = command.Peso,
                Comprimento = command.Comprimento,
                ComprimentoCauda = command.ComprimentoCauda,
                DataBiometria = command.DataDeEntrada
            };
            await biometriaAnimalRepository.AddAsync(biometria);

            response.Id = savedAnimal.Id;
            response.Animal = mapper.Map<RotinaAnimalDetailVm>(savedAnimal);
            response.Message = "Animal cadastrado com sucesso!";
 
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