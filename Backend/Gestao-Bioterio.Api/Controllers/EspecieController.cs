using Gestao_Bioterio.Application.Features.Especies.Command.DeleteEspecie;
using Gestao_Bioterio.Application.Features.Especies.Queries.GetEspecieDatail;
using Gestao_Bioterio.Application.Features.Especies.Queries.GetEspeciesLookup;
using Gestao_Bioterio.Application.Features.Species.Command.CreateSpecie;
using Gestao_Bioterio.Application.Features.Species.Command.UpdateSpecie;
using Gestao_Bioterio.Application.Features.Species.Queries.GetAllSpecies;
using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EspecieController : ControllerBase
    {
        private readonly IMediator _mediator;

        public EspecieController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("lookup", Name = "GetEspeciesLookup")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Animal", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<EspecieLookupVm>>> GetLookup()
        {
            var result = await _mediator.Send(new GetEspeciesLookupQuery());
            return Ok(result);
        }

        [HttpGet(Name = "GetAllEspecies")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Espécies cadastradas", NivelAcesso.Visualizar)]
        public async Task<ActionResult<PaginatedEspecieListVm>> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllEspeciesQuery 
            {
                SearchTerm = search,
                Page = page,
                PageSize = pageSize
            });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetEspecieById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RequirePermission("Espécies cadastradas", NivelAcesso.Visualizar)]
        public async Task<ActionResult<SpecieDetailVm>> GetById(int id)
        {
            var result = await _mediator.Send(new GetEspecieDetailQuery { Id = id });
            return Ok(result);
        }

        [HttpPost(Name = "AddEspecies")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Espécies cadastradas", NivelAcesso.Gerenciar)]
        public async Task<ActionResult<CreateEspecieResponse>> Create([FromBody] CreateEspecieCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut(Name = "UpdateEspecies")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [RequirePermission("Espécies cadastradas", NivelAcesso.Editar)]
        public async Task<ActionResult> Update(
           [FromBody] UpdateEspecieCommand command)
        {
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("{id}", Name = "DeleteEspecie")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [RequirePermission("Espécies cadastradas", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            await _mediator.Send(new DeleteEspecieCommand { Id = id });
            return NoContent();
        }
    }

}
