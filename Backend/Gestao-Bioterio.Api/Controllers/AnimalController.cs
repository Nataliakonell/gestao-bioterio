using Gestao_Bioterio.Application.Features.Animais.Command.CreateAnimal;
using Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail;
using Gestao_Bioterio.Application.Features.Animais.Command.DeleteAnimal;
using Gestao_Bioterio.Application.Features.Animais.Command.UpdateAnimal;
using Gestao_Bioterio.Application.Features.Animais.Queries.GetAllAnimals;
using Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalLookup;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Gestao_Bioterio.Api.Filters;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnimalController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AnimalController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("lookup", Name = "GetAnimalLookup")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Animal", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<AnimalLookupVm>>> GetLookup()
        {
            var result = await _mediator.Send(new GetAnimalLookupQuery());
            return Ok(result);
        }

        [HttpGet(Name = "GetAllAnimais")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Animal", NivelAcesso.Visualizar)]
        public async Task<ActionResult<PaginatedAnimalListVm>> GetAllAnimais(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? situacaoAnimal = null,
            [FromQuery] int? especieId = null,
            [FromQuery] int? genero = null,
            [FromQuery] string? search = null,
            [FromQuery] string? faseDeVida = null)
        {
            var query = new GetAllAnimalsQuery
            {
                Page = page,
                PageSize = pageSize,
                SituacaoAnimal = situacaoAnimal.HasValue ? (Situacao)situacaoAnimal.Value : null,
                EspecieId = especieId,
                Genero = genero.HasValue ? (Genero)genero.Value : null,
                NumeroRegistro = search,
                FaseDeVida = faseDeVida?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse).ToList()
            };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpPost(Name = "AddAnimal")]
        [RequirePermission("Animal", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromForm] CreateAnimalCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpGet("{id}", Name = "GetAnimalById")]
        [RequirePermission("Animal", NivelAcesso.Visualizar)]
        public async Task<ActionResult<RotinaAnimalDetailVm>> GetAnimalById(int id)
        {
            var getAnimalDetailQuery = new GetAnimalDetailQuery() { Id = id };
            return Ok(await _mediator.Send(getAnimalDetailQuery));
        }

        [HttpPut(Name = "UpdateAnimal")]
        [RequirePermission("Animal", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromForm] UpdateAnimalCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteAnimal")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Animal", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var deleteAnimalCommand = new DeleteAnimalCommand() { Id = id };
            await _mediator.Send(deleteAnimalCommand);
            return NoContent();
        }
    }
}

