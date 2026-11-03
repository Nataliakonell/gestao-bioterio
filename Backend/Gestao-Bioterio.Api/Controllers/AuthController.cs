using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // Rota que o Keycloak chama de volta com o token
    [HttpGet("callback")]
    public IActionResult Callback([FromQuery] string? token, [FromQuery] string? returnUrl)
    {
        if (string.IsNullOrEmpty(token))
            return BadRequest("Token is required");


        var decodedUrl = !string.IsNullOrEmpty(returnUrl)
            ? System.Web.HttpUtility.UrlDecode(returnUrl) : "/";
        return Redirect(decodedUrl);
    }

    [HttpGet("session")]
    public async Task<IActionResult> Session(
        [FromQuery] string? token,
        [FromServices] IHttpClientFactory httpClientFactory)
    {
        if (string.IsNullOrEmpty(token))
            return Unauthorized(new { message = "No active session" });

        using var httpClient = httpClientFactory.CreateClient();
        httpClient.BaseAddress = new Uri("https://accounts.ucdb.br");

        var request = new HttpRequestMessage(HttpMethod.Get, "/keycloak/userinfo");
        request.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await httpClient.SendAsync(request);
        if (response.IsSuccessStatusCode)
        {
            var userInfo = await response.Content
                .ReadFromJsonAsync<System.Text.Json.JsonElement>();
            return Ok(new { authenticated = true, user = userInfo });
        }

        return Unauthorized(new { message = "Invalid session" });
    }
}