"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_1 = require("@nestjs/swagger");
function setupSwagger(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Telegram Signal Bot API')
        .setDescription('A comprehensive API for managing crypto signal subscriptions and Telegram bot interactions. ' +
        'This API allows users to register, authenticate, manage subscriptions, and link their Telegram accounts.')
        .setVersion('1.0.0')
        .addTag('auth', 'Authentication and user management endpoints')
        .addTag('users', 'User profile and account management endpoints')
        .addTag('bot', 'Telegram bot interaction endpoints')
        .addTag('subscriptions', 'Crypto signal subscription management')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addServer('http://localhost:3000', 'Development server')
        .addServer('https://api.yourdomain.com', 'Production server')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'none',
            filter: true,
            showRequestDuration: true,
            syntaxHighlight: {
                theme: 'monokai',
            },
        },
        customSiteTitle: 'Telegram Signal Bot API Documentation',
        customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; font-size: 36px; }
      .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    `,
    });
    return document;
}
//# sourceMappingURL=swagger.config.js.map