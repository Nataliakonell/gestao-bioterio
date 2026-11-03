using Gestao_Bioterio.Application.Features.Localizacoes.Command.CreateLocalizacao;
using Gestao_Bioterio.Application.Features.Localizacoes.Command.DeleteLocalizacao;
using Gestao_Bioterio.Application.Features.Localizacoes.Command.UpdateLocalizacao;
using Gestao_Bioterio.Application.Features.Localizacoes.Queries.GetAllLocalizacao;
using Gestao_Bioterio.Application.Features.Localizacoes.Queries.GetLocalizacaoDetail;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LocalizacaoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllLocalizacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<LocalizacaoListVm>>> GetAll()
        {
            var result = await mediator.Send(new GetAllLocalizacaoQuery());
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetLocalizacaoById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<LocalizacaoDetailVm>> GetById(int id)
        {
            var result = await mediator.Send(new GetLocalizacaoDetailQuery { Id = id });
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost(Name = "AddLocalizacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<CreateLocalizacaoResponse>> Create([FromBody] CreateLocalizacaoCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpPut(Name = "UpdateLocalizacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> Update([FromBody] UpdateLocalizacaoCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpDelete("{id}", Name = "DeleteLocalizacao")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new DeleteLocalizacaoCommand { Id = id });
            return NoContent();
        }
    }
}
