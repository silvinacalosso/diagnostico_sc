exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        return { statusCode: 500, body: 'Falta la clave de API de Resend en el servidor' };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: 'Invalid JSON' };
    }

    const { nombre, email, perfil } = body;

    if (!nombre || !email || !perfil) {
        return { statusCode: 400, body: 'Faltan datos' };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev',
                to: 'formacionbienestarinteligente@gmail.com',
                subject: `Nuevo Diagnóstico de ${nombre}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #000;">¡Nuevo Diagnóstico Recibido!</h2>
                        <p>Alguien completó el formulario en tu página web. Aquí están sus datos:</p>
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 15px;">
                            <p><strong>Nombre:</strong> ${nombre}</p>
                            <p><strong>Email del cliente:</strong> ${email}</p>
                            <p><strong>Perfil (Diagnóstico):</strong> ${perfil}</p>
                        </div>
                        <br>
                        <p><em>Recuerda contactar a este cliente manualmente para enviarle sus resultados correspondientes a su perfil.</em></p>
                    </div>
                `
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Resend error:', result);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: result })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, id: result.id })
        };

    } catch (err) {
        console.error('Error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
