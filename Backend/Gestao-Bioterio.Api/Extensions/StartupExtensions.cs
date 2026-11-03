using Gestao_Bioterio.Application;
using Gestao_Bioterio.Api.Middleware;
using Gestao_Bioterio.Infra;
using Gestao_Bioterio.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Threading.RateLimiting;

namespace Gestao_Bioterio.Api.Extensions
{
    public static class StartupExtensions
    {
        public static void ConfigureServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                });

            services.AddPersistenceServices(configuration);
            services.AddApplicationServices();
            services.AddInfrastructureServices(configuration);

            services.AddCors(options =>
            {
                options.AddPolicy("AllowLocalhost", policy =>
                {
                    policy.WithOrigins(
                        "http://localhost:5173",
                        "https://localhost:5173",
                        "https://localhost:7240",
                        "http://localhost:7240",
                        "https://localhost:5279",
                        "http://localhost:5279",
                        "http://localhost:3000",
                        "https://localhost:3000"
                    )
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                });
            });

            services.AddMemoryCache();
            services.AddHttpClient("UcdbAuth");
            services.Configure<UcdbAuthenticationOptions>(configuration.GetSection("UcdbAuthentication"));

            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = 429;

                options.OnRejected = async (context, cancellationToken) =>
                {
                    context.HttpContext.Response.ContentType = "application/json";
                    if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    {
                        context.HttpContext.Response.Headers.RetryAfter =
                            ((int)retryAfter.TotalSeconds).ToString();
                    }

                    await context.HttpContext.Response.WriteAsJsonAsync(new
                    {
                        success = false,
                        message = "Muitas requisições em um curto intervalo. Aguarde alguns instantes e tente novamente."
                    }, cancellationToken);
                };

                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 100,
                            Window = TimeSpan.FromMinutes(1),
                            QueueLimit = 20,
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            AutoReplenishment = true
                        }));
            });

            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Gestão Biotério API",
                    Version = "v1.0",
                    Description = "API para gerenciamento de animais, espécies, localizações e grupos do biotério.",
                    Contact = new OpenApiContact
                    {
                        Name = "Biotério UCDB",
                        Email = "bioterio@ucdb.br"
                    }
                });

                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    options.IncludeXmlComments(xmlPath);
                }


            });
        }

        public static async Task ResetDatabaseAsync(this WebApplication app)
        {
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
                await context.Database.EnsureDeletedAsync();
                await context.Database.MigrateAsync();
            }
        }

        public static void UseStartupExtensions(this WebApplication app)
        {
            app.UseCustomExceptionHandler();
            app.UseRateLimiter();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Gestão Biotério API v1.0");
                    options.RoutePrefix = string.Empty;
                    options.DisplayOperationId();
                    options.DefaultModelsExpandDepth(2);
                    options.UseRequestInterceptor("(request) => { request.headers['X-Swagger-Request'] = 'true'; return request; }");
                });
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowLocalhost");
            app.UseUcdbAuthentication();
            app.UseAuthorization();

            app.MapControllers();
        }
    }
}
