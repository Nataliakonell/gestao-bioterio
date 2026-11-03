using Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.CreateMovimentacaoAnimal;
using Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.DeleteMovimentacaoAnimal;
using Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.UpdateMovimentacaoAnimal;
using Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Queries.GetAllMovimentacaoAnimal;
using Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Queries.GetMovimentacaoAnimalDetail;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MovimentacaoAnimalController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllMovimentacaoAnimal")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<MovimentacaoAnimalListVm>>> GetAll([FromQuery] int? animalId = null)
        {
            var result = await mediator.Send(new GetAllMovimentacaoAnimalQuery { AnimalId = animalId });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetMovimentacaoAnimalById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MovimentacaoAnimalDetailVm>> GetById(int id)
        {
            var result = await mediator.Send(new GetMovimentacaoAnimalDetailQuery { Id = id });
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost(Name = "AddMovimentacaoAnimal")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<CreateMovimentacaoAnimalResponse>> Create([FromBody] CreateMovimentacaoAnimalCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpPut(Name = "UpdateMovimentacaoAnimal")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> Update([FromBody] UpdateMovimentacaoAnimalCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpDelete("{id}", Name = "DeleteMovimentacaoAnimal")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new DeleteMovimentacaoAnimalCommand { Id = id });
            return NoContent();
        }
    }
}
