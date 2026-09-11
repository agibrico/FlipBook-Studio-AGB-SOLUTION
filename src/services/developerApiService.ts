/**
 * PHASE 30: Explorateur d'API REST Développeur & Moteur Webhooks
 * Documentation interactive Swagger-like, simulateur d'appels API en direct
 * et générateur d'extraits de code (cURL, JS, Python, PHP).
 */

import { ApiEndpointDoc } from '../types/saas';

export const API_ENDPOINTS: ApiEndpointDoc[] = [
  {
    method: 'GET',
    path: '/api/v1/flipbooks',
    summary: 'Lister tous les flipbooks de l’organisation',
    description: 'Retourne la liste paginée des flipbooks avec leur statut, audience et métadonnées.',
    requiresAuth: true,
    sampleResponse: {
      status: 'success',
      total: 3,
      data: [
        {
          id: 'fb-hotel-riviera',
          title: 'Brochure Prestige & Suites - Saison 2026',
          slug: 'brochure-hotel-riviera',
          totalPages: 4,
          visibility: 'PUBLIC',
          viewsCount: 1420,
          whiteLabel: true,
          createdAt: '2026-03-01T10:00:00Z',
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/api/v1/flipbooks/{id}/leads',
    summary: 'Extraire les prospects capturés (Leads)',
    description: 'Récupère tous les formulaires remplis (nom, email, téléphone, page source).',
    requiresAuth: true,
    sampleResponse: {
      status: 'success',
      flipbookId: 'fb-hotel-riviera',
      count: 2,
      leads: [
        {
          id: 'lead-001',
          fullName: 'Marc Dutertre',
          email: 'marc.dutertre@invest.fr',
          phone: '+33 6 78 90 12 34',
          pageNumber: 2,
          status: 'QUALIFIED',
          capturedAt: '2026-09-08T14:22:00Z',
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/api/v1/orders',
    summary: 'Créer une commande catalogue (Shoppable)',
    description: 'Enregistre une nouvelle commande issue du lecteur interactif ou d’une intégration tierce.',
    requiresAuth: true,
    sampleRequest: {
      flipbookId: 'fb-hotel-riviera',
      customerName: 'Alexandre Laurent',
      customerPhone: '+33 6 12 34 56 78',
      items: [
        { sku: 'SUITE-PRES-01', quantity: 1, variant: 'Haute Saison' },
      ],
      checkoutMode: 'DIRECT',
    },
    sampleResponse: {
      status: 'success',
      orderId: 'CMD-2026-9042',
      totalAmount: 1200,
      currency: 'EUR',
      paymentStatus: 'PENDING',
      confirmationUrl: 'https://flipbookstudio.app/orders/CMD-2026-9042',
    },
  },
  {
    method: 'POST',
    path: '/api/v1/webhooks/test',
    summary: 'Déclencher un événement webhook de test',
    description: 'Émet immédiatement un ping HTTP POST vers l’URL configurée avec signature HMAC SHA-256.',
    requiresAuth: true,
    sampleRequest: {
      event: 'lead.captured',
      targetUrl: 'https://api.crm-client.com/webhooks/flipbook',
    },
    sampleResponse: {
      status: 'delivered',
      statusCode: 200,
      durationMs: 42,
      signature: 'sha256=a87f8b9e6c439120...',
    },
  },
];

export function generateCodeSnippet(
  endpoint: ApiEndpointDoc,
  language: 'curl' | 'javascript' | 'python' | 'php',
  apiKey: string = 'fbk_live_9a87d6e5c4b3a2'
): string {
  const url = `https://api.flipbookstudio.app${endpoint.path}`;

  switch (language) {
    case 'curl':
      return `curl -X ${endpoint.method} "${url}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"${
    endpoint.sampleRequest
      ? ` \\\n  -d '${JSON.stringify(endpoint.sampleRequest, null, 2)}'`
      : ''
  }`;

    case 'javascript':
      return `const response = await fetch("${url}", {
  method: "${endpoint.method}",
  headers: {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
  }${
    endpoint.sampleRequest
      ? `,\n  body: JSON.stringify(${JSON.stringify(endpoint.sampleRequest, null, 4)})`
      : ''
  }
});
const data = await response.json();
console.log(data);`;

    case 'python':
      return `import requests

headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}

${
  endpoint.sampleRequest
    ? `payload = ${JSON.stringify(endpoint.sampleRequest, null, 4)}\nresponse = requests.${endpoint.method.toLowerCase()}("${url}", json=payload, headers=headers)`
    : `response = requests.${endpoint.method.toLowerCase()}("${url}", headers=headers)`
}

print(response.status_code)
print(response.json())`;

    case 'php':
      return `<?php
$ch = curl_init("${url}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer ${apiKey}",
    "Content-Type: application/json"
]);
${
  endpoint.sampleRequest
    ? `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${endpoint.method}");\ncurl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(${JSON.stringify(endpoint.sampleRequest)}));`
    : ''
}
$result = curl_exec($ch);
curl_close($ch);
echo $result;`;
  }
}
