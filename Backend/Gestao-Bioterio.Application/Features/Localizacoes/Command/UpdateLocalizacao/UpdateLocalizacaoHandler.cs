using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Command.UpdateLocalizacao
{
    public class UpdateLocalizacaoHandler(
        IMapper mapper,
        ILocalizacaoRepository localizacaoRepository,
        IValidator<UpdateLocalizacaoCommand> validator
    ) : IRequestHandler<UpdateLocalizacaoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateLocalizacaoCommand command, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da atualização da localização.";
                return response;
            }

            var localizacao = await localizacaoRepository.GetByIdAsync(command.Id);
            if (localizacao == null)
            {
                throw new NotFoundException(nameof(Localizacao), command.Id);
            }

            var todasLocalizacoes = await localizacaoRepository.ListAllAsync();

            // Valida se o novo pai não é descendente do nó atual (prevenção de ciclos)
            if (command.LocalizacaoPaiId.HasValue)
            {
                if (IsDescendant(command.Id, command.LocalizacaoPaiId.Value, todasLocalizacoes))
                {
                    response.Success = false;
                    response.ValidationErrors = new List<string> { "Não é permitido mover uma localização para dentro de uma de suas sublocalizações." };
                    response.Message = "Estrutura hierárquica inválida.";
                    return response;
                }
            }

            var antigoCaminhoHierarquia = localizacao.CaminhoHierarquia ?? localizacao.Nome;
            var antigoCaminhoIds = localizacao.CaminhoIds ?? $"/{localizacao.Id}";

            // Atualiza campos básicos
            localizacao.Nome = command.Nome;
            localizacao.Ambiente = command.Ambiente;
            localizacao.LocalizacaoPaiId = (command.LocalizacaoPaiId.HasValue && command.LocalizacaoPaiId.Value > 0) ? command.LocalizacaoPaiId : null;

            // Recalcula CaminhoHierarquia e CaminhoIds para o nó atual
            if (command.LocalizacaoPaiId.HasValue)
            {
                var pai = todasLocalizacoes.FirstOrDefault(x => x.Id == command.LocalizacaoPaiId.Value);
                if (pai != null)
                {
                    localizacao.CaminhoHierarquia = !string.IsNullOrWhiteSpace(pai.CaminhoHierarquia)
                        ? $"{pai.CaminhoHierarquia} -> {command.Nome}"
                        : $"{pai.Nome} -> {command.Nome}";

                    localizacao.CaminhoIds = !string.IsNullOrWhiteSpace(pai.CaminhoIds)
                        ? $"{pai.CaminhoIds}/{localizacao.Id}"
                        : $"/{pai.Id}/{localizacao.Id}";
                }
                else
                {
                    localizacao.CaminhoHierarquia = command.Nome;
                    localizacao.CaminhoIds = $"/{localizacao.Id}";
                }
            }
            else
            {
                localizacao.CaminhoHierarquia = command.Nome;
                localizacao.CaminhoIds = $"/{localizacao.Id}";
            }

            await localizacaoRepository.UpdateAsync(localizacao);

            // Propaga alteração de caminho para os descendentes caso caminho tenha mudado
            var novoCaminhoHierarquia = localizacao.CaminhoHierarquia;
            var novoCaminhoIds = localizacao.CaminhoIds;

            if (antigoCaminhoHierarquia != novoCaminhoHierarquia || antigoCaminhoIds != novoCaminhoIds)
            {
                await PropagatePathUpdatesAsync(localizacao.Id, antigoCaminhoHierarquia, novoCaminhoHierarquia, antigoCaminhoIds, novoCaminhoIds, todasLocalizacoes);
            }

            response.Success = true;
            response.Message = "Localização atualizada com sucesso!";
            return response;
        }

        private static bool IsDescendant(int ancestorId, int targetId, IEnumerable<Localizacao> all)
        {
            var current = all.FirstOrDefault(x => x.Id == targetId);
            while (current != null && current.LocalizacaoPaiId.HasValue)
            {
                if (current.LocalizacaoPaiId.Value == ancestorId)
                    return true;

                current = all.FirstOrDefault(x => x.Id == current.LocalizacaoPaiId.Value);
            }
            return false;
        }

        private async Task PropagatePathUpdatesAsync(
            int parentId,
            string oldParentHierarquia,
            string newParentHierarquia,
            string oldParentIds,
            string newParentIds,
            IEnumerable<Localizacao> all)
        {
            var children = all.Where(x => x.LocalizacaoPaiId == parentId).ToList();

            foreach (var child in children)
            {
                var oldChildHierarquia = child.CaminhoHierarquia ?? $"{oldParentHierarquia} -> {child.Nome}";
                var oldChildIds = child.CaminhoIds ?? $"{oldParentIds}/{child.Id}";

                child.CaminhoHierarquia = $"{newParentHierarquia} -> {child.Nome}";
                child.CaminhoIds = $"{newParentIds}/{child.Id}";

                await localizacaoRepository.UpdateAsync(child);

                await PropagatePathUpdatesAsync(child.Id, oldChildHierarquia, child.CaminhoHierarquia, oldChildIds, child.CaminhoIds, all);
            }
        }
    }
}
