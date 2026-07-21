FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy all csproj files and restore as distinct layers
COPY ["ErpSystem.Api/ErpSystem.Api.csproj", "ErpSystem.Api/"]
COPY ["ErpSystem.Application/ErpSystem.Application.csproj", "ErpSystem.Application/"]
COPY ["ErpSystem.Domain/ErpSystem.Domain.csproj", "ErpSystem.Domain/"]
COPY ["ErpSystem.Infrastructure/ErpSystem.Infrastructure.csproj", "ErpSystem.Infrastructure/"]
RUN dotnet restore "./ErpSystem.Api/ErpSystem.Api.csproj"

# Copy the remaining files and build
COPY . .
WORKDIR "/src/ErpSystem.Api"
RUN dotnet build "./ErpSystem.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./ErpSystem.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ErpSystem.Api.dll"]
