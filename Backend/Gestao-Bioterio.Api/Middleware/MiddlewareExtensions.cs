namespace Gestao_Bioterio.Api.Middleware
{
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder UseCustomExceptionHandler(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ExceptionHandlerMiddleware>();
        }

        public static IApplicationBuilder UseUcdbAuthentication(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<UcdbAuthenticationMiddleware>();
        }
    }
}
