using Gestao_Bioterio.Application.Features.LocaisOrigem.Command.CreateLocalOrigem;
using Gestao_Bioterio.Application.Features.LocaisOrigem.Command.UpdateLocalOrigem;
using Gestao_Bioterio.Application.Features.LocaisOrigem.Queries.GetAllLocalOrigem;
using Gestao_Bioterio.Application.Features.LocaisOrigem.Queries.GetLocalOrigemDetail;
using Gestao_Bioterio.Application.Features.LocaisOrigem.Queries.GetLocalOrigemLookup;
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
    public class LocalOrigemController(IMediator mediator) : ControllerBase
    {
        [HttpGet("lookup", Name = "GetLocalOrigemLookup")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Locais de origem cadastrados", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<LocalOrigemLookupVm>>> GetLookup()
        {
            var result = await mediator.Send(new GetLocalOrigemLookupQuery());
            return Ok(result);
        }

        [HttpGet("all", Name = "GetAllLocalOrigem")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Locais de origem cadastrados", NivelAcesso.Visualizar)]
        public async Task<ActionResult<PaginatedLocalOrigemListVm>> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await mediator.Send(new GetAllLocalOrigemQuery 
            {
                SearchTerm = search,
                Page = page,
                PageSize = pageSize
            });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetLocalOrigemById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RequirePermission("Locais de origem cadastrados", NivelAcesso.Visualizar)]
        public async Task<ActionResult<LocalOrigemDetailVm>> GetById(int id)
        {
            var result = await mediator.Send(new GetLocalOrigemDetailQuery { Id = id });
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpPost(Name = "AddLocalOrigem")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Locais de origem cadastrados", NivelAcesso.Gerenciar)]
        public async Task<ActionResult<CreateLocalOrigemResponse>> Create([FromBody] CreateLocalOrigemCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpPut(Name = "UpdateLocalOrigem")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RequirePermission("Locais de origem cadastrados", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateLocalOrigemCommand command)
        {
            var result = await mediator.Send(command);
            if (!result.Success && result.Message == "Local de origem não encontrado.")
                return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}", Name = "DeleteLocalOrigem")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RequirePermission("Locais de origem cadastrados", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await mediator.Send(new Gestao_Bioterio.Application.Features.LocaisOrigem.Command.DeleteLocalOrigem.DeleteLocalOrigemCommand { Id = id });
            if (!result.Success && result.Message == "Local de origem não encontrado.")
                return NotFound();
            if (!result.Success)
                return BadRequest(result);
                
            return Ok(result);
        }
    }
}
