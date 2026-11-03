using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Command.CreateLocalizacao
{
    public class CreateLocalizacaoHandler(
        IMapper mapper,
        ILocalizacaoRepository localizacaoRepository,
        IValidator<CreateLocalizacaoCommand> validator
    ) : IRequestHandler<CreateLocalizacaoCommand, CreateLocalizacaoResponse>
    {
        public async Task<CreateLocalizacaoResponse> Handle(CreateLocalizacaoCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateLocalizacaoResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da localização.";
                return response;
            }

            var localizacao = mapper.Map<Localizacao>(command);
            if (localizacao.LocalizacaoPaiId.HasValue && localizacao.LocalizacaoPaiId.Value <= 0) localizacao.LocalizacaoPaiId = null;

            if (command.LocalizacaoPaiId.HasValue && command.LocalizacaoPaiId.Value > 0)
            {
                var localizacaoPai = await localizacaoRepository.GetByIdAsync(command.LocalizacaoPaiId.Value);
                if (localizacaoPai != null)
                {
                    localizacao.CaminhoHierarquia = !string.IsNullOrWhiteSpace(localizacaoPai.CaminhoHierarquia)
                        ? $"{localizacaoPai.CaminhoHierarquia} -> {command.Nome}"
                        : $"{localizacaoPai.Nome} -> {command.Nome}";
                }
                else
                {
                    localizacao.CaminhoHierarquia = command.Nome;
                }
            }
            else
            {
                localizacao.CaminhoHierarquia = command.Nome;
            }

            localizacao = await localizacaoRepository.AddAsync(localizacao);

            if (command.LocalizacaoPaiId.HasValue)
            {
                var localizacaoPai = await localizacaoRepository.GetByIdAsync(command.LocalizacaoPaiId.Value);
                localizacao.CaminhoIds = localizacaoPai != null && !string.IsNullOrWhiteSpace(localizacaoPai.CaminhoIds)
                    ? $"{localizacaoPai.CaminhoIds}/{localizacao.Id}"
                    : $"/{command.LocalizacaoPaiId.Value}/{localizacao.Id}";
            }
            else
            {
                localizacao.CaminhoIds = $"/{localizacao.Id}";
            }

            await localizacaoRepository.UpdateAsync(localizacao);

            response.Id = localizacao.Id;
            response.Localizacao = mapper.Map<CreateLocalizacaoDto>(localizacao);
            response.Message = "Localização cadastrada com sucesso!";

            return response;
        }
    }
}
