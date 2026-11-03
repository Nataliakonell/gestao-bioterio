using Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.CreateAnimalLocalizacao;
using Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.DeleteAnimalLocalizacao;
using Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.UpdateAnimalLocalizacao;
using Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAllAnimalLocalizacao;
using Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAnimalLocalizacaoDetail;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnimalLocalizacaoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllAnimalLocalizacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<AnimalLocalizacaoListVm>>> GetAll()
        {
            var result = await mediator.Send(new GetAllAnimalLocalizacaoQuery());
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetAnimalLocalizacaoById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AnimalLocalizacaoDetailVm>> GetById(int id)
        {
            var result = await mediator.Send(new GetAnimalLocalizacaoDetailQuery { Id = id });
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost(Name = "AddAnimalLocalizacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<CreateAnimalLocalizacaoResponse>> Create([FromBody] CreateAnimalLocalizacaoCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpPut(Name = "UpdateAnimalLocalizacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> Update([FromBody] UpdateAnimalLocalizacaoCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpDelete("{id}", Name = "DeleteAnimalLocalizacao")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new DeleteAnimalLocalizacaoCommand { Id = id });
            return NoContent();
        }
    }
}
