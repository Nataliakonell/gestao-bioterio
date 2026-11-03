using Gestao_Bioterio.Application.Features.Groups.Command.CreateGroup;
using Gestao_Bioterio.Application.Features.Groups.Command.DeleteGroup;
using Gestao_Bioterio.Application.Features.Groups.Command.UpdateGroup;
using Gestao_Bioterio.Application.Features.Groups.Queries.GetAllGroups;
using Gestao_Bioterio.Application.Features.Grupos.Queries.GetGrupoLookup;
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

    public class GrupoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GrupoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("lookup", Name = "GetGrupoLookup")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Espécies cadastradas", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<GrupoLookupVm>>> GetLookup()
        {
            var result = await _mediator.Send(new GetGrupoLookupQuery());
            return Ok(result);
        }

        [HttpGet(Name = "GetAllGrupos")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Espécies cadastradas", NivelAcesso.Visualizar)]

        public async Task<ActionResult<PaginatedGroupListVm>> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllGruposQuery 
            {
                SearchTerm = search,
                Page = page,
                PageSize = pageSize
            });
            return Ok(result);
        }

        [HttpPost(Name = "AddGrupos")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Espécies cadastradas", NivelAcesso.Gerenciar)]
        public async Task<ActionResult<int>> Create(
    [FromBody] CreateGrupoCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(id);
        }

        [HttpPut(Name = "UpdateGrupo")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [RequirePermission("Espécies cadastradas", NivelAcesso.Editar)]
        public async Task<ActionResult> Update(
           [FromBody] UpdateGrupoCommand command)
        {
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("{id}", Name = "DeleteGrupo")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [RequirePermission("Espécies cadastradas", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            await _mediator.Send(new DeleteGrupoCommand { Id = id });
            return NoContent();
        }
    }    

}
