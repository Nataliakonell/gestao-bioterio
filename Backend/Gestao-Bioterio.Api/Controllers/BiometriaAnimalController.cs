using Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail;
using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.CreateBiometriaAnimais;
using Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.DeleteBiometriaAnimal;
using Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.UpdateBiometriaAnimal;
using Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetAllBiometriaAnimal;
using Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetBiometriaAnimalDetail;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BiometriaAnimalController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BiometriaAnimalController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet(Name = "GetAllBiometriaAnimal")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Biometria", NivelAcesso.Visualizar)]
        public async Task<ActionResult<PaginatedBiometriaAnimalListVm>> GetAllBiometriaAnimal(
            [FromQuery] int? animalId = null,
            [FromQuery] string? search = null,
            [FromQuery] int? especieId = null,
            [FromQuery] string? faseDeVida = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllRotinaAnimalQuery 
            { 
                AnimalId = animalId,
                SearchTerm = search,
                EspecieId = especieId,
                FaseDeVida = faseDeVida?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse).ToList(),
                Page = page,
                PageSize = pageSize
            });
            return Ok(result);
        }

        [HttpPost(Name = "AddBiometriaAnimal")]
        [RequirePermission("Biometria", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateBiometriaAnimalCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpGet("{id}", Name = "GetBiometriaAnimalById")]
        [RequirePermission("Biometria", NivelAcesso.Visualizar)]
        public async Task<ActionResult<RotinaAnimalDetailVm>> GetBiometriaAnimalById(int id)
        {
            var getBiometriaAnimalDetailQuery = new GetBiometriaAnimalDetailQuery() { Id = id };
            return Ok(await _mediator.Send(getBiometriaAnimalDetailQuery));
        }

        [HttpPut(Name = "UpdateBiometriaAnimal")]
        [RequirePermission("Biometria", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateBiometriaAnimalCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteBiometriaAnimal")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Biometria", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var deleteBiometriaAnimalCommand = new DeleteBiometriaAnimalCommand() { Id = id };
            await _mediator.Send(deleteBiometriaAnimalCommand);
            return NoContent();
        }
    }
}
